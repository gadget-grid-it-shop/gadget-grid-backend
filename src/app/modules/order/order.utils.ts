import { Query } from "mongoose";
import { TProduct } from "../product/product.interface";
import Deal from "../deals/deals.model";
import { AddOrderPayload, IOrderItem } from "./order.interface";
import FlashSale from "../flashSales/flashSale.model";
import { Product } from "../product/product.model";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { Request } from "express";

export const calculateDiscountPrice = (
  price: number,
  discount: TProduct["discount"],
): { discountPrice: number; discountAmount: number } => {
  let discountPrice = price;
  let discountAmount = 0;
  if (!discount) {
    return { discountPrice, discountAmount };
  }

  if (discount.type === "flat") {
    discountPrice = Number(price) - Number(discount.value);
    discountAmount = Number(price) - discountPrice;
  }

  if (discount.type === "percent") {
    discountPrice = price - price * (discount.value / 100);
    discountAmount = Number(price) - discountPrice;
  }

  return { discountPrice, discountAmount };
};

export const generateOrderNumber = async <T>(OrderModel: Query<T[], T>) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    // Get start and end of today
    const startOfDay = new Date(
      year,
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
    );
    const endOfDay = new Date(
      year,
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
    );

    // Count orders for today
    const countToday = await OrderModel.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Increment for the new order
    const orderSequence = countToday + 1;

    return `GG-${year}${month}${day}${orderSequence
      .toString()
      .padStart(4, "0")}`;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Utility to calculate complete order pricing data before creating an order.
 * Reusable for frontend preview, cart summary, or any pre-order calculation API.
 */
export const calculateOrderPricing = async (data: AddOrderPayload) => {
  const activeDeals = await Deal.find({ isActive: true });
  const activeSale = await FlashSale.findOne({ isActive: true });

  const products = await Product.find({
    _id: { $in: data.products?.map((p) => p.id) },
  }).lean();

  // Validation
  for (const pdt of data.products) {
    const exist = products.find((p) => p._id.toString() === pdt.id.toString());
    if (!exist) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Sorry, some products are not available",
      );
    }

    if (
      exist.productType === "variant" &&
      exist.variants &&
      exist.variants.length > 0
    ) {
      if (!pdt.selectedVariant) {
        throw new AppError(
          httpStatus.CONFLICT,
          "Variant selection is required for variant products",
        );
      }

      const variant = exist.variants.find((v) => {
        return Object.entries(pdt.selectedVariant!).every(
          ([key, value]) =>
            v.attributes[key] ===
            (typeof value === "string" ? value : value.id),
        );
      });

      if (!variant) {
        throw new AppError(
          httpStatus.CONFLICT,
          "Selected variant combination is not available",
        );
      }

      if (variant.quantity < pdt.quantity) {
        throw new AppError(
          httpStatus.CONFLICT,
          "Sorry, some products are not available",
        );
      }
    } else {
      if (exist.quantity < pdt.quantity) {
        throw new AppError(
          httpStatus.CONFLICT,
          "Sorry, some products are not available",
        );
      }
    }
  }

  const items: IOrderItem[] = products.map((p) => {
    const orderProduct = data.products.find(
      (op) => op.id.toString() === p._id.toString(),
    );

    const deal = activeDeals.find(
      (d) => d._id?.toString() === orderProduct?.offer?.refId?.toString(),
    );

    const hasSale =
      orderProduct?.offer?.type === "flashSale" &&
      activeSale?._id?.toString() === orderProduct?.offer?.refId?.toString();

    const dealProduct = deal?.products.find(
      (dp) => dp.productId.toString() === p._id.toString(),
    );

    const saleProduct = hasSale
      ? activeSale?.products?.find(
          (sp) => sp.productId.toString() === p._id.toString(),
        )
      : null;

    const discountCal = calculateDiscountPrice(
      p.price,
      saleProduct
        ? saleProduct.discount
        : dealProduct
          ? dealProduct.discount
          : p.discount,
    );

    return {
      name: p.name,
      productId: p._id,
      finalPrice: discountCal.discountPrice,
      quantity: orderProduct?.quantity || 1,
      shipping: p.shipping.free ? 0 : p.shipping.cost,
      tax: 0,
      image: p.thumbnail || p.gallery?.[0] || "",
      prePayment: p?.prePayment || {
        hasPrePayment: false,
        prePaymentAmount: 0,
      },
      discountApplied: {
        discountValue: discountCal.discountAmount,
        description: deal?.title,
        type: deal ? "deal" : "product",
      },
      originalPrice: p.price,
      selectedVariant: orderProduct?.selectedVariant,
    };
  });

  const subtotal = items.reduce(
    (acc, item) => acc + item.finalPrice * item.quantity,
    0,
  );

  const shippingCost = data.shippingMethod === "inside" ? 80 : 130;

  const taxAmount = items.reduce(
    (acc, item) => acc + item.tax * item.quantity,
    0,
  );

  const totalAmount = subtotal + shippingCost + taxAmount;

  return {
    items,
    subtotal,
    shippingCost,
    taxAmount,
    totalAmount,
    // Optional: include raw data for frontend display
    rawProducts: products,
    activeDeals,
    activeSale,
  };
};

export const getClientIp = (req: Request): string => {
  const ip =
    // Cloudflare
    (req.headers["cf-connecting-ip"] as string) ||
    // Most common proxy header
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    // Alternative
    (req.headers["x-real-ip"] as string) ||
    // Express default
    req.ip ||
    // Fallbacks
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "127.0.0.1";

  return ip;
};
