import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CategoryServices } from "./category.service";

const createCategory = catchAsync(async (req, res) => {
  const result = await CategoryServices.createCategoryIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully created category",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req, res) => {


  const isTree = req.query.isTree as string

  const result = await CategoryServices.getAllCategoriesFromDB(isTree);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully retirved all categories",
    data: result,
  });
});

const getSingleCategories = catchAsync(async (req, res) => {
  const result = await CategoryServices.getSingleCategoryFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully retirved category",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req, res) => {

  const result = await CategoryServices.deleteCategoryFromDB(req.params.id)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Category deleted successfully',
    data: result

  })
})


const updateCategory = catchAsync(async (req, res) => {

  const result = await CategoryServices.updateCategoryIntoDB(req.params.id, req.body)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Category updated successfully',
    data: result

  })
})



export const CategoryControllers = {
  createCategory,
  getAllCategories,
  getSingleCategories,
  deleteCategory,
  updateCategory
};
