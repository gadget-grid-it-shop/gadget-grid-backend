import { Types } from "mongoose";
import { TCategory } from "./category.interface";
import { Category } from "./category.model";
import { generateCategoryTree } from "./category.utils";

const createCategoryIntoDB = async (payload: TCategory) => {
  const result = await Category.create(payload);

  return result;
};

const getAllCategories = async () => {
  const categories = await Category.find().populate([
    {
      path: "product_details_categories",
      select: "-_id -__v",
    }
  ]);

  const categoryTree = generateCategoryTree(categories);

  return categoryTree;
};

export const CategoryServices = {
  createCategoryIntoDB,
  getAllCategories,
};
