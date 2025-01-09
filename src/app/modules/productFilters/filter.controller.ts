import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { FilterServices } from "./filter.service";

const createFilter = catchAsync(async (req, res) => {
    const result = await FilterServices.createFilterIntoDB(req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Product filter created successfully',
        data: result
    })
})

export const FilterControllers = { createFilter }