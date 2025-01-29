import { Types } from "mongoose";
import { TCategory, TUpdateCategory } from "./category.interface";
import { Category } from "./category.model";
import { generateCategoryTree } from "./category.utils";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { TAdminAndUser } from "../../interface/customRequest";
import {
  addNotifications,
  buildNotifications,
} from "../notification/notificaiton.utils";

const createCategoryIntoDB = async (
  payload: TCategory,
  admin: TAdminAndUser
) => {
  const parent_id = payload.parent_id || null;

  const result = await Category.create({ ...payload, parent_id });

  if (result) {
    const notifications = await buildNotifications({
      actionType: "create",
      notificationType: "category",
      source: result._id,
      text: "added a category",
      thisAdmin: admin,
    });

    await addNotifications({ notifications, userFrom: admin });
  }

  return result;
};

const getAllCategoriesFromDB = async (isTree: string) => {
  const categories = await Category.find({ isDeleted: false }).populate([
    {
      path: "product_details_categories",
      select: "-__v",
    },
  ]);

  if (isTree === "false") {
    return categories;
  }

  const categoryTree = generateCategoryTree(categories);

  return categoryTree;
};

const deleteCategoryFromDB = async (id: string, admin: TAdminAndUser) => {
  const exist = await Category.findById(id);

  if (exist) {
    const result = await Category.findByIdAndUpdate(id, { isDeleted: true });

    if (result) {
      const notifications = await buildNotifications({
        actionType: "delete",
        notificationType: "category",
        source: result._id,
        text: "deleted a category",
        thisAdmin: admin,
      });

      await addNotifications({ notifications, userFrom: admin });
    }
    return result;
  } else {
    throw new AppError(httpStatus.CONFLICT, "Categoy does not exist");
  }
};

const updateCategoryIntoDB = async (
  id: string,
  payload: TUpdateCategory,
  admin: TAdminAndUser
) => {
  const exist = await Category.findById(id);
  if (exist) {
    const result = await Category.findByIdAndUpdate(id, payload, { new: true });
    if (result) {
      const notifications = await buildNotifications({
        actionType: "update",
        notificationType: "category",
        source: result._id,
        text: "updated a category",
        thisAdmin: admin,
      });

      await addNotifications({ notifications, userFrom: admin });
    }
    return result;
  } else {
    throw new AppError(httpStatus.CONFLICT, "Categoy does not exist");
  }
};

const getSingleCategoryFromDB = async (id: string) => {
  const result = await Category.findById(id).populate([
    {
      path: "product_details_categories",
      select: "-__v",
    },
  ]);

  if (result === null) {
    throw new AppError(httpStatus.CONFLICT, "Categoy does not exist");
  }

  return result;
};

export const CategoryServices = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  deleteCategoryFromDB,
  updateCategoryIntoDB,
  getSingleCategoryFromDB,
};
