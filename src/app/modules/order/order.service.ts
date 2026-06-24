import { AddOrderPayload, IOrder } from "./order.interface";
import { calculateOrderPricing, generateOrderNumber } from "./order.utils";
import { Types } from "mongoose";
import Order from "./order.model";
import config from "../../config";
import Stripe from "stripe";
import { User } from "../user/user.model";
import Address from "../address/address.model";
import { Response, Request } from "express";
import {
  addNotifications,
  buildNotifications,
} from "../notification/notificaiton.utils";
import { TNotification } from "../notification/notification.interface";
import { IAddress } from "../address/address.interface";
import { EmailJobName, emailQueue } from "../../queues/email.queue";
import { OrderJobName, orderQueue } from "./order.queue";

let stripe: Stripe | null = null;

try {
  stripe = require("stripe")(config.stripe_secret_key || "");
} catch (err) {
  console.log(err);
}

export const paymentWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;
  const endpint_secret = config.stripe_enpoint_secret;

  if (!stripe || !endpint_secret) {
    return;
  }

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpint_secret);
  } catch (err: any) {
    console.log(err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const paymentData = event.data?.object as Stripe.Checkout.Session;

      if (paymentData.payment_status === "paid") {
        try {
          const options: Partial<IOrder> = {
            paymentStatus: "paid",
            paymentDetails: {
              transactionId: paymentData.payment_intent as string,
              paymentDate: new Date(),
            },
            totalAmount: (paymentData?.amount_total || 0) / 100,
            currentStatus: "confirmed",
          };

          const res = await Order.findByIdAndUpdate(
            paymentData.client_reference_id,
            {
              $set: options,
              $push: {
                statusHistory: [
                  {
                    notes: "Order has been confirmed",
                    status: "confirmed",
                    timestamp: new Date(),
                  },
                ],
              },
            },
            { new: true },
          );

          if (res) {
            try {
              const thisUser = await User.findOne({
                email: paymentData?.metadata?.userEmail,
              }).lean();
              if (!thisUser) {
                return;
              }
              await emailQueue.add(EmailJobName.sendPaymentConfirmationEmail, {
                order: res,
                user: thisUser,
              });
            } catch (err) {
              console.log(err);
            }
          }
        } catch (err) {
          console.log(err);
        }
      }
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
};

const getCartPriceDataFromDB = async (data: AddOrderPayload) => {
  const orderPricingData = await calculateOrderPricing(data);
  const { shippingCost, taxAmount, totalAmount, subtotal, items } =
    orderPricingData || {};
  return { shippingCost, taxAmount, totalAmount, subtotal, items };
};

const addOrderToDB = async (data: AddOrderPayload) => {
  const thisUser = await User.findOne({ email: data.userEmail });

  const payload: Partial<IOrder> = {
    billingAddress: data.billingAddress,
    paymentDetails: {
      transactionId: "",
    },
    paymentMethod: data.paymentMethod,
    shippingMethod: data.shippingMethod,
    currentStatus: "pending",
    notes: data?.notes || "",
    statusHistory: [
      {
        status: "pending",
        timestamp: new Date(),
        notes: "Order placed successfully",
      },
    ],
    ...(thisUser && { user: thisUser._id }),
    userEmail: data.userEmail,
    userPhone: data.userPhone,
    userName: data.userName,
    orderNumber: await generateOrderNumber(Order.find()),
  };

  const orderPricingData = await calculateOrderPricing(data);
  const { items, shippingCost, taxAmount, totalAmount, subtotal } =
    orderPricingData || {};

  payload.items = items;
  payload.shippingCost = shippingCost;
  payload.taxAmount = taxAmount;
  payload.totalAmount = totalAmount;
  payload.subtotal = subtotal;

  const order = await Order.create(payload);

  if (data.saveAddress && thisUser) {
    try {
      const addressPayload: IAddress = {
        user: thisUser._id,
        address: data.shippingAddress?.address,
        area: data.shippingAddress?.area,
        district: data.shippingAddress?.district,
      };

      await Address.create(addressPayload);
    } catch (err) {
      console.log(err);
    }
  }

  if (order) {
    await orderQueue.add(OrderJobName.updateProductStock, data);

    try {
      const notifications = await buildNotifications({
        actionType: "create",
        notificationType: "order",
        source: order.orderNumber,
        text: "added an order",
        thisUser: thisUser || undefined,
      });

      const notification: TNotification | null = thisUser
        ? {
            notificationType: "order",
            actionType: "create",
            opened: false,
            userFrom: thisUser?._id,
            userTo: thisUser?._id,
            source: String(order.orderNumber),
            text: `Order placed successfully`,
          }
        : null;

      await addNotifications({
        notifications: [
          ...notifications,
          ...(notification ? [notification] : []),
        ],
        userFrom: thisUser || undefined,
      });
      await emailQueue.add(EmailJobName.sendOrderConfirmationEmail, {
        user: thisUser,
        order,
      });
    } catch (err) {}
  }

  if (data.paymentMethod === "card") {
    if (!stripe) {
      return { order };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        ...payload.items.map((item) => ({
          price_data: {
            currency: "bdt",
            product_data: {
              name: item.name,
              images: item.image ? [item.image] : [],
            },
            unit_amount: item.finalPrice * 100,
          },
          quantity: item.quantity,
        })),
        {
          price_data: {
            currency: "bdt",
            product_data: { name: "Tax" },

            //============================= need to add tax data=========================================================

            unit_amount: Math.round(0 * 100),
          },
          quantity: 1,
        },
      ],
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: Math.round(order.shippingCost * 100),
              currency: "bdt",
            },
            display_name: "Standard Shipping",
          },
        },
      ],
      payment_intent_data: {
        description: `Order from Gadget Grid`, // Add company name to payment description
      },
      success_url: `${process.env.CLIENT_URL}/orders/${order.orderNumber}`,
      cancel_url: `${process.env.CLIENT_URL}/orders/${order.orderNumber}`,
      client_reference_id: order._id.toString(),
      metadata: {
        orderId: order._id.toString(),
        userEmail: data.userEmail,
        userPhone: data.userPhone,
        ...(thisUser && { userRole: thisUser.role }),
        company: "Gadget Grid",
      },
    });

    return {
      order,
      sessionId: session.url,
    };
  }

  return { order };
};

const getMyOrdersFromDB = async (
  query: Record<string, unknown>,
  userId: string,
) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;

  const skip = (page - 1) * 10;

  const orders = await Order.find({ user: userId }).skip(skip).limit(limit);

  return orders;
};

interface AdminOrderQuery {
  page?: string | number;
  limit?: string | number;
  userId?: string; // filter by user
  discountType?: "product" | "flashSale" | "deal" | "coupon" | "all"; // discountApplied.type
  minPrice?: string | number;
  maxPrice?: string | number;
  status?: string;
  paymentStatus?: string;
  search?: string; // optional: search by orderNumber
  sortBy?: string; // e.g., "createdAt", "totalAmount"
  sortOrder?: "asc" | "desc";
}

const admingetAllOrdersFromDb = async (query: AdminOrderQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10)); // cap limit
  const skip = (page - 1) * limit;

  // Build filter object
  const filter: any = {};

  // 1. Filter by user (optional now for admin)
  if (query.userId) {
    filter.user = new Types.ObjectId(query.userId);
  }

  // 2. Filter by discountApplied.type inside items array
  if (query.discountType && query.discountType !== "all") {
    filter["items.discountApplied.type"] = query.discountType;
  }

  // 3. Price range filtering on totalAmount
  if (query.minPrice || query.maxPrice) {
    filter.totalAmount = {};
    if (query.minPrice) {
      filter.totalAmount.$gte = Number(query.minPrice);
    }
    if (query.maxPrice) {
      filter.totalAmount.$lte = Number(query.maxPrice);
    }
  }

  // Optional: filter by current status
  if (query.status && query.status !== "all") {
    filter.currentStatus = query.status;
  }

  // Optional: filter by payment status
  if (query.paymentStatus && query.paymentStatus !== "all") {
    filter.paymentStatus = query.paymentStatus;
  }

  // Optional: search by order number (partial match)
  if (query.search) {
    filter.orderNumber = { $regex: query.search, $options: "i" };
  }

  // Sorting
  const sort: any = {};
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  if (["createdAt", "totalAmount", "orderNumber"].includes(sortBy)) {
    sort[sortBy] = sortOrder;
  } else {
    sort.createdAt = -1; // default
  }

  // Execute query with aggregation for better performance on array fields
  const orders = await Order.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        userEmail: "$userInfo.email",
        "userInfo.fullName": {
          $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"],
        },
      },
    },
    // Lookup product supplier for each order item
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "productLookup",
      },
    },
    {
      $addFields: {
        items: {
          $map: {
            input: "$items",
            as: "item",
            in: {
              $mergeObjects: [
                "$$item",
                {
                  supplier: {
                    $ifNull: [
                      {
                        $arrayElemAt: [
                          "$productLookup.supplier",
                          {
                            $indexOfArray: [
                              "$productLookup._id",
                              "$$item.productId",
                            ],
                          },
                        ],
                      },
                      "gadgetgrid",
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    { $sort: sort },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        "userInfo.password": 0,
        "userInfo.__v": 0,
        "userInfo.address": 0,
        "userInfo.opt": 0,
        "userInfo.userType": 0,
        "userInfo.isVerified": 0,
        productLookup: 0,
      },
    },
  ]);

  // Get total count for pagination metadata
  const totalPipeline = [{ $match: filter }, { $count: "total" }];
  const totalResult = await Order.aggregate(totalPipeline);
  const total = totalResult[0]?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

const getOrderByOrderNumberFormDB = async (orderNumber: string) => {
  const result = await Order.findOne({ orderNumber })
    .populate("user")
    .populate([
      {
        path: "items.productId",
        select: "supplier",
      },
      {
        path: "statusHistory.updatedBy",
        select: "fullName name email profilePicture role",
        populate: [
          {
            path: "role",
            select: "role",
          },
        ],
      },
    ])
    .lean();

  if (result) {
    const plain = result;
    plain.items = plain.items.map((item) => {
      const product = item.productId as any;
      return {
        ...item,
        supplier: product?.supplier || "gadgetgrid",
        productId:
          typeof product === "object" ? product._id.toString() : product,
      } as any;
    });
    return plain;
  }

  return result;
};

const adminUpdateOrderToDB = async (
  userId: Types.ObjectId,
  id: string,
  updateData: Partial<IOrder>,
) => {
  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");

  const thisUser = await User.findById(userId);

  const customer = await User.findById(order.user);

  // Auto-add to status history if currentStatus changed
  if (
    updateData.currentStatus &&
    updateData.currentStatus !== order.currentStatus
  ) {
    order.statusHistory.push({
      status: updateData.currentStatus,
      notes:
        updateData.notes?.trim() ||
        `Status updated to ${updateData.currentStatus} by admin`,
      timestamp: new Date(),
      updatedBy: userId,
    });
  }

  // Merge updates
  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    {
      $set: {
        ...updateData,
        shippingAddress: updateData.shippingAddress,
        billingAddress: updateData.billingAddress || updateData.shippingAddress,
        currentStatus: updateData.currentStatus || order.currentStatus,
        paymentStatus: updateData.paymentStatus || order.paymentStatus,
        paymentMethod: updateData.paymentMethod || order.paymentMethod,
        shippingMethod: updateData.shippingMethod || order.shippingMethod,
        trackingNumber: updateData.trackingNumber,
      },
      ...(updateData.currentStatus && { statusHistory: order.statusHistory }),
    },
    { new: true, runValidators: true },
  ).populate("user", "name email phone");

  if (order && thisUser) {
    try {
      const notifications = await buildNotifications({
        actionType: "update",
        notificationType: "order",
        source: order.orderNumber,
        text: `updated an order ${order.orderNumber}`,
        thisUser: thisUser,
      });

      let notification: TNotification;

      if (customer) {
        notification = {
          notificationType: "order",
          actionType: "update",
          opened: false,
          userFrom: customer._id,
          userTo: customer?._id,
          source: String(order.orderNumber),
          text: `Order update ${order.orderNumber}. ${
            updateData.currentStatus &&
            updateData.currentStatus !== order.currentStatus &&
            `Your order is ${updateData.currentStatus}`
          }`,
        };

        await addNotifications({
          notifications: [notification],
          userFrom: customer,
        });
      }

      await addNotifications({
        notifications,
        userFrom: thisUser,
      });
    } catch (err) {
      console.log(err);
    }
  }
  return updatedOrder;
};

export const OrderServices = {
  addOrderToDB,
  getMyOrdersFromDB,
  getOrderByOrderNumberFormDB,
  admingetAllOrdersFromDb,
  adminUpdateOrderToDB,
  getCartPriceDataFromDB,
};
