import { FilterQuery, Query, Types } from "mongoose";
import { Category } from "./category.model";
import { TCategory } from "./category.interface";

export const generateCategoryTree = (categories: FilterQuery<TCategory[]>, parent_id = null) => {
  let categoryTree: TCategory[] = [];

  console.log(categories)

  let filterCategories;

  if (parent_id === null) {
    filterCategories = categories.filter((cat) => cat.parent_id === null);
  } else {
    filterCategories = categories.filter((cat) => cat.parent_id === parent_id);
  }

  for (const category of filterCategories) {
    categoryTree.push({
      _id: category._id,
      name: category.name,
      parent_id: category.parent_id,
      product_details_categories: category.product_details_categories,
      subCategories: generateCategoryTree(categories, category.id),
    });
  }

  return categoryTree;
};
