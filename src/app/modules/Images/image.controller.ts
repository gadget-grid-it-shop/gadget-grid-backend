import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ImageUploadServices } from "./image.service";

const uploadImage = catchAsync(async (req, res) => {

    const { type, folder } = req.body.type

    const result = await ImageUploadServices.uploadImageIntoDB(req.files as Express.Multer.File[], type, folder)

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

const deleteImages = catchAsync(async (req, res) => {
    const { public_ids, database_ids } = req.body

    console.log(req.body)

    const result = await ImageUploadServices.deleteImagesFromDB({ public_ids, database_ids })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Successfully deleted image(s)",
        data: result
    })
})

export const ImageUploadController = {
    uploadImage,
    getAllImages,
    deleteImages
}