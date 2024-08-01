import {ObjectId} from "mongodb";
import {TProductDetailsCategory} from "./productDetailsCategory.interface";
import {ProductDetailsCategory} from "./productDetailsCategory.model";
import {Types} from "mongoose";

const createProductDetailsCategoryIntoDB = async (payload: TProductDetailsCategory) => {
  const result = await ProductDetailsCategory.create(payload);

  return result;
};

const updateProductDetailsCategoryIntoDB = async (id: string, payload: Partial<TProductDetailsCategory>) => {
  const exist = await ProductDetailsCategory.findOne({_id: new ObjectId(id)});

  console.log(exist);

  if (!exist) {
    throw new Error("Product details category not found");
  }

  const result = await ProductDetailsCategory.findByIdAndUpdate(id, payload, {new: true});

  return result;
};

export const ProductDetailsCategoryServices = {
  createProductDetailsCategoryIntoDB,
  updateProductDetailsCategoryIntoDB,
};
