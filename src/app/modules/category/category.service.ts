import { Types } from "mongoose";
import { TCategory } from "./category.interface";
import { Category } from "./category.model";
import { generateCategoryTree } from "./category.utils";

const createCategoryIntoDB = async (payload: TCategory) => {

  console.log(payload)

  const result = await Category.create(payload);

  return result;
};

const getAllCategoriesFromDB = async () => {
  const categories = await Category.find({ isDeleted: false }).populate([
    {
      path: "product_details_categories",
      select: "-_id -__v",
    }
  ]);

  const categoryTree = generateCategoryTree(categories);

  return categoryTree;
};


const deleteCategoryFromDB = async (id: string) => {
  const exist = await Category.findById(id)

  if (exist) {

    const result = await Category.findByIdAndUpdate(id, { isDeleted: true })

    return result
  }

  else {
    throw new Error('Categoy does not exist')
  }

}

export const CategoryServices = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  deleteCategoryFromDB
};
