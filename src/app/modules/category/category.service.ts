import { Types } from "mongoose";
import { TCategory, TUpdateCategory } from "./category.interface";
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
      select: "-__v",
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


const updateCategoryIntoDB = async (id: string, payload: TUpdateCategory) => {
  const exist = await Category.findById(id)
  if (exist) {

    const result = await Category.findByIdAndUpdate(id, payload, { new: true })

    return result

  }

  else {
    throw new Error('Categoy does not exist')
  }

}

const getSingleCategoryFromDB = async (id: string) => {

  const result = await Category.findById(id).populate([
    {
      path: 'product_details_categories',
      select: "-__v",
    }
  ])

  if (result === null) {
    throw new Error('Categoy does not exist')
  }

  return result
}

export const CategoryServices = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  deleteCategoryFromDB,
  updateCategoryIntoDB,
  getSingleCategoryFromDB
};
