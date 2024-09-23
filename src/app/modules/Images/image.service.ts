import { startSession } from "mongoose"
import cloudinary from "../../lib/image/image.config"
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary"
import { TImage } from "./image.interface"
import { Image } from "./image.model"


const uploadImageIntoDB = async (file: string) => {
    const session = await startSession()

    try {
        session.startTransaction()

        const uploadImage: UploadApiResponse = await cloudinary.uploader.upload(file || "", function (err: UploadApiErrorResponse, result: UploadApiResponse) {
            if (err) {
                throw new Error('upload failed')
            }

            return result
        })

        await session.commitTransaction()

        const image: TImage = {
            extension: uploadImage.format,
            height: uploadImage.height,
            width: uploadImage.width,
            image: uploadImage.url,
            name: uploadImage.original_filename,
            size: uploadImage.bytes
        }

        const databaseResult = await Image.create(image)

        if (!databaseResult) {
            throw new Error('upload failed')
        }

        await session.commitTransaction()
        await session.endSession()
        return databaseResult
    }
    catch (err) {
        await session.abortTransaction()
        await session.endSession()
        throw new Error('upload failed')
    }
}


export const ImageUploadServices = { uploadImageIntoDB }



