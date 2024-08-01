import {TProductDetailsCategory} from "./productDetailsCategory.interface";
import {ProductDetailsCategory} from "./productDetailsCategory.model";

const createProductDetailsCategoryIntoDB = async (payload: TProductDetailsCategory) => {
  const result = await ProductDetailsCategory.create(payload);

  return result;
};

export const ProductDetailsCategoryServices = {
  createProductDetailsCategoryIntoDB,
};
