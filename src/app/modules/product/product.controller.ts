import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProductServices } from "./product.service";

const createProduct = catchAsync(async (req, res) => {
    const email = req.user.email
    const result = await ProductServices.createProductIntoDB(req.body, email)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Successfully Created Product",
        data: result
    })
})

const getAllProduct = catchAsync(async (req, res) => {
    const result = await ProductServices.getAllProductsFromDB()

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Successfully Created Product",
        data: result
    })
})

const bulkUpload = catchAsync(async (req, res) => {
    const file = req.file
    const mapedFields = JSON.parse(req.body.mapedFields)
    const result = await ProductServices.bulkUploadToDB(file, mapedFields)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Successfully Created Product",
        data: result
    })
})

export const ProductControllers = {
    createProduct,
    getAllProduct,
    bulkUpload
}