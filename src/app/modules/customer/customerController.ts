import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CategoryServices } from "../category/category.service";

const getCategories = catchAsync(async (req, res) => {
  const categories = await CategoryServices.getAllCategoriesFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully retirved all categories",
    data: categories,
  });
});

const getFeaturedCategories = catchAsync(async (req, res) => {
  const categories = await CategoryServices.getFeaturedCategoriesFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully retirved all categories",
    data: categories,
  });
});

const getStaticCategorySlugs = catchAsync(async (req, res) => {
  const result = await CategoryServices.getStaticCategorySlugsFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Categories retrived successfully",
    data: result,
  });
});

export const customerController = {
  getCategories,
  getFeaturedCategories,
  getStaticCategorySlugs,
};
