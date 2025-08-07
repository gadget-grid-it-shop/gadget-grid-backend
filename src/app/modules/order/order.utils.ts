import { Model, Query } from "mongoose";
import { TProduct } from "../product/product.interface";

export const calculateDiscountPrice = (
  price: number,
  discount: TProduct["discount"]
) => {
  let discountPrice = price;
  if (!discount) {
    return discountPrice;
  }

  if (discount.type === "flat") {
    discountPrice = Number(price) - Number(discount.value);
  }

  if (discount.type === "percent") {
    discountPrice = price - price * (discount.value / 100);
  }

  return discountPrice;
};

export const generateOrderNumber = async <T>(OrderModel: Query<T[], T>) => {
  try {
    // Get count of existing orders
    const count = await OrderModel.countDocuments();

    // Generate next sequence number (handles zero orders case)
    const orderSequence = count + 1;
    const currentYear = new Date().getFullYear();

    return `ORD-${currentYear}-${orderSequence.toString().padStart(6, "0")}`;
  } catch (error) {
    console.log(error);
  }
};
