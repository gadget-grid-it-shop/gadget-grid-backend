import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ImageUploadServices } from "./image.service";

const uploadImage = catchAsync(async (req, res) => {
    const result = await ImageUploadServices.uploadImageIntoDB(req.files as Express.Multer.File[], req.body.type)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Images upload successfully",
        data: result
    })
})

export const ImageUploadController = {
    uploadImage
}