import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ImageUploadServices } from "./image.service";

const uploadImage = catchAsync(async (req, res) => {

    // console.log(req.files)

    const result = await ImageUploadServices.uploadImageIntoDB(req.files as Express.Multer.File[], req.body.type)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Images upload successfully",
        data: result
    })
})


const getAllImages = catchAsync(async (req, res) => {

    // console.log(req.files)

    const result = await ImageUploadServices.getAllImagesFromDB()

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Retrived images successfully",
        data: result
    })
})

export const ImageUploadController = {
    uploadImage,
    getAllImages
}