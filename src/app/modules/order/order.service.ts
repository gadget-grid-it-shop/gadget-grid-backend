import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { Product } from "../product/product.model";
import { AddOrderPayload, IOrder } from "./order.interface";
import { calculateDiscountPrice, generateOrderNumber } from "./order.utils";
import { Types } from "mongoose";
import Order from "./order.model";
import config from "../../config";
import Stripe from "stripe";
import { User } from "../user/user.model";

let stripe: Stripe | null = null;

try {
  stripe = require("stripe")(config.stripe_secret_key || "");
} catch (err) {
  console.log(err);
}

const addOrderToDB = async (data: AddOrderPayload, user: Types.ObjectId) => {
  const thisUser = await User.findById(user);

  if (!thisUser) {
    throw new AppError(httpStatus.FORBIDDEN, "Failed to create order");
  }

  const payload: Partial<IOrder> = {
    billingAddress: data.billingAddress,
    shippingAddress: data.shippingAddress,
    paymentDetails: {
      paymentDate: new Date(),
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
        notes: "",
      },
    ],
    userId: thisUser._id,
    orderNumber: await generateOrderNumber(Order.find()),
  };

  const products = await Product.find({
    _id: { $in: data.products?.map((p) => p.id) },
  }).lean();

  for (const pdt of data.products) {
    const exist = products.find((p) => p._id.toString() === pdt.id.toString());
    if (!exist) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Sorry, some products are not available"
      );
    }
    if (exist.quantity < pdt.quantity) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Sorry, some products are not available"
      );
    }
  }

  payload.items = products.map((p) => ({
    name: p.name,
    productId: p._id,
    price: calculateDiscountPrice(p.price, p.discount),
    quantity:
      data.products.find((pd) => pd.id.toString() === p._id.toString())
        ?.quantity || 1,
    shipping: p.shipping.free ? 0 : p.shipping.cost,
    tax: 0,
    image: p.thumbnail || p.gallery?.[0] || "",
  }));

  payload.totalAmount = payload.items.reduce((acc, item) => {
    return acc + item.price;
  }, 0);

  payload.shippingCost = payload.items.reduce((acc, item) => {
    return acc + item.shipping;
  }, 0);

  const order = await Order.create(payload);

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
            unit_amount: item.price * 100,
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
      success_url: `${process.env.CLIENT_URL}/my-profile?tab=orders&invoice=${order.orderNumber}`,
      cancel_url: `${process.env.CLIENT_URL}/my-profile?tab=orders&invoice=${order.orderNumber}`,
      client_reference_id: order._id.toString(),
      metadata: {
        orderId: order._id.toString(),
        userEmail: thisUser.email,
        userRole: thisUser.role,
        company: "Gadget Grid",
      },
    });

    return {
      order,
      sessionId: session.url,
    };
  }
};

export const OrderServices = { addOrderToDB };
