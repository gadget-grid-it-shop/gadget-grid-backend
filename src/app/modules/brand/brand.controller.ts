import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { BrandService } from "./brand.service";

const createBrand = catchAsync(async (req, res) => {
    const payload = req.body

    const result = await BrandService.createBrandIntoDB(payload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Brand create successfully",
        data: result
    })
})

const updateBrand = catchAsync(async (req, res) => {
    const payload = req.body
    const id = req.params.id

    const result = await BrandService.updateBrandIntoDB(id, payload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Brand updated successfully",
        data: result
    })
})


export const BrandController = {
    createBrand,
    updateBrand
}