import { startSession } from "mongoose"
import cloudinary from "../../lib/image/image.config"
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary"
import { TImage } from "./image.interface"
import { Image } from "./image.model"


const uploadImageIntoDB = async (files: Express.Multer.File[], type: string) => {
    const session = await startSession()

    console.log(files)

    try {
        session.startTransaction()

        const uploadImages = files.map(file => {
            return cloudinary.uploader.upload(file.path, function (err: UploadApiErrorResponse, result: UploadApiResponse) {
                if (err) {
                    throw new Error('cloudinary upload failed')
                }

                return result
            })
        })

        const uploadedImages: UploadApiResponse[] = await Promise.all(uploadImages).catch(err => { throw new Error('upload failed') })

        const payloadImages: TImage[] = uploadedImages.map((image: UploadApiResponse) => (
            {
                extension: image.format,
                height: image.height,
                width: image.width,
                image: image.url,
                name: image.original_filename,
                size: image.bytes,
                image_type: type
            }
        ))

        const databaseResult = await Image.create(payloadImages)

        if (!databaseResult) {
            throw new Error('databae upload failed')
        }

        await session.commitTransaction()
        await session.endSession()
        return databaseResult
    }
    catch (err) {
        console.log(err)
        await session.abortTransaction()
        await session.endSession()
        throw new Error('upload failed')
    }
}


export const ImageUploadServices = { uploadImageIntoDB }



