import {Types} from "mongoose";
import {TCategory} from "./category.interface";
import {Category} from "./category.model";
import {generateCategoryTree} from "./category.utils";

const createCategoryIntoDB = async (payload: TCategory) => {
  const result = await Category.create(payload);

  return result;
};

// const getAllCategories = async () => {
//   const categories = await Category.find({parent_id: {$exists: false}})
//     .populate([
//       {
//         path: "subCategories",
//         select: {name: 1, parent_id: 0},
//       },
//     ])
//     .select({product_details_categories: 0});

//   return categories;
// };
const getAllCategories = async () => {
  const categories = await Category.find().populate([
    {
      path: "product_details_categories",
      select: "-_id -__v",
    }, {
      path: "parent_id"
    }
  ]);

  // const categoryTree = generateCategoryTree(categories);

  return categories;
};

export const CategoryServices = {
  createCategoryIntoDB,
  getAllCategories,
};
