import { Types } from "mongoose";
import { IDeal } from "./deals.interface";
import Deal from "./deals.model";
import redisClient from "../../../redis";
import { RedisKeys } from "../../interface/common";
import { TProduct } from "../product/product.interface";
import { Product } from "../product/product.model";
import { ObjectId } from "mongodb";
import { setProductsToRedis } from "../product/product.redis";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const createDealToDb = async (data: Partial<IDeal>, user: Types.ObjectId) => {
  const payload: Partial<IDeal> = {
    title: data.title,
    description: data.description,
    endTime: data.endTime,
    startTime: data.startTime,
    image: data.image,
    createdBy: user,
    lastUpdatedBy: user,
    isActive: false,
  };

  const result = await Deal.create(payload);

  return result;
};

const addProductsToDealToDB = async (
  data: IDeal["products"],
  user: Types.ObjectId,
  deal: string
) => {
  const dealExist = await Deal.findById(deal);

  if (!dealExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Could not find deal");
  }

  if (new Date(dealExist.endTime) < new Date()) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Deal has already ended. cannot add product now"
    );
  }

  const existingProductIds = dealExist.products.map((p) =>
    p.productId.toString()
  );

  const newProductsOnly = data.filter(
    (reqProduct) =>
      !existingProductIds.includes(reqProduct.productId.toString())
  );

  if (newProductsOnly.length === 0) {
    throw new AppError(httpStatus.CONFLICT, "Found no new products to add");
  }

  let products: IDeal["products"] = [];
  let notFoundProducts = 0;

  const redisData = await redisClient.get(RedisKeys.products);

  if (redisData !== null) {
    const redisProducts = JSON.parse(redisData);
    for (const reqProduct of newProductsOnly) {
      const exist = redisProducts.find(
        (p: TProduct) => p._id.toString() === reqProduct.productId.toString()
      );
      if (exist) {
        products.push(reqProduct);
      } else {
        notFoundProducts++;
      }
    }
  } else {
    const databaseProducts = await Product.find({
      _id: { $in: newProductsOnly.map((p) => new ObjectId(p.productId)) },
    }).lean();
    for (const reqProduct of newProductsOnly) {
      const exist = databaseProducts.find(
        (p: TProduct) => p._id.toString() === reqProduct.productId.toString()
      );
      if (exist) {
        products.push(reqProduct);
      } else {
        notFoundProducts++;
      }
    }
    await setProductsToRedis();
  }

  if (products.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No valid new products to add");
  }

  // Append new valid products to existing ones
  const updatedProducts = [...dealExist.products, ...products];

  const result = await Deal.findByIdAndUpdate(
    deal,
    { products: updatedProducts, lastUpdatedBy: user },
    { new: true }
  );

  return {
    products: result?.products,
    notFoundProducts,
    addedProducts: products.length,
  };
};

export const DealsServices = {
  createDealToDb,
  addProductsToDealToDB,
};
