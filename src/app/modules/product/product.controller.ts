import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProductServices } from "./product.service";

const createProduct = catchAsync(async (req, res) => {
    const result = await ProductServices.createProductIntoDB(req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Successfully Created Product",
        data: result
    })
})

export const ProductControllers = {
    createProduct
}