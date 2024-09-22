import { ObjectId } from "mongodb";
import { TProductDetailsCategory } from "./productDetailsCategory.interface";
import { ProductDetailsCategory } from "./productDetailsCategory.model";
import { Types } from "mongoose";

const createProductDetailsCategoryIntoDB = async (payload: TProductDetailsCategory) => {
  const result = await ProductDetailsCategory.create(payload);

  return result;
};

const updateProductDetailsCategoryIntoDB = async (id: string, payload: Partial<TProductDetailsCategory>) => {
  const exist = await ProductDetailsCategory.findOne({ _id: id });


  if (!exist) {
    throw new Error("Product details category not found");
  }

  const result = await ProductDetailsCategory.findByIdAndUpdate(id, payload, { new: true });

  return result;
};

const getSingleProductDetailsCategoryFromDB = async (id: string) => {
  const result = await ProductDetailsCategory.findOne({ _id: id });
  return result;
};

const getAllProductDetailsCategoryFromDB = async () => {
  const result = await ProductDetailsCategory.find();
  return result;
};

const deleteProductDetailsCategoryFromDB = async (id: string) => {
  const result = await ProductDetailsCategory.findByIdAndDelete(id)
  return result
}

export const ProductDetailsCategoryServices = {
  createProductDetailsCategoryIntoDB,
  updateProductDetailsCategoryIntoDB,
  getSingleProductDetailsCategoryFromDB,
  getAllProductDetailsCategoryFromDB,
  deleteProductDetailsCategoryFromDB
};
