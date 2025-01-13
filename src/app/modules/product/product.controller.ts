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
    const query = req.query
    const result = await ProductServices.getAllProductsFromDB(query)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Successfully retrived all products",
        data: result.products,
        pagination: result.pagination
    })
})

const getSingleProduct = catchAsync(async (req, res) => {
    const result = await ProductServices.getSingleProductFromDB(req.params.id)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Successfully retrived product",
        data: result
    })
})

const bulkUpload = catchAsync(async (req, res) => {
    const email = req.user.email
    const file = req.file
    const mapedFields = JSON.parse(req.body.mapedFields)
    const result = await ProductServices.bulkUploadToDB(file, mapedFields, email)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Product bulk upload complete",
        data: result
    })
})

const updateProduct = catchAsync(async (req, res) => {
    const id = req.params.id

    const result = await ProductServices.updateProductIntoDB(id, req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Updated product successfully",
        data: result
    })
})

export const ProductControllers = {
    createProduct,
    getAllProduct,
    bulkUpload,
    getSingleProduct,
    updateProduct
}