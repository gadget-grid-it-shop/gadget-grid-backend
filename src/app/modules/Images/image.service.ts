import { startSession } from "mongoose"
import cloudinary from "../../lib/image/image.config"
import { DeleteApiResponse, UploadApiErrorResponse, UploadApiResponse } from "cloudinary"
import { TImage } from "./image.interface"
import { Image } from "./image.model"


const uploadImageIntoDB = async (files: Express.Multer.File[], type: string, folder: string | null) => {
    const session = await startSession()


    console.log(files)

    try {
        session.startTransaction()

        const uploadImages = files.map(file => {
            return cloudinary.uploader.upload(file.path, function (err: UploadApiErrorResponse, result: UploadApiResponse) {
                if (err) {
                    console.log('cloudeinaty failed')
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
                image_type: type,
                public_id: image.public_id,
                folder: folder
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


const getAllImagesFromDB = async () => {
    const result = await Image.find().sort({ 'createdAt': 1 })
    return result
}


const deleteImagesFromDB = async ({ public_ids, database_ids }: { public_ids: string[], database_ids: string[] }) => {


    const session = await startSession()

    try {
        session.startTransaction()
        const deletedFromCloud: DeleteApiResponse = await cloudinary.api.delete_resources([...public_ids], { type: 'upload', resource_type: 'image' })

        if (!deletedFromCloud) {
            throw new Error('Failed to delete from cloud')
        }

        console.log(deletedFromCloud)

        const deleteFromBD = await Image.deleteMany({ _id: { $in: [...database_ids] } })

        if (!deleteFromBD) {
            throw new Error('Failed to delete from database')
        }

        console.log(deleteFromBD)

        await session.commitTransaction()
        await session.endSession()

        return deleteFromBD
    }
    catch (err) {
        console.log(err)
        await session.abortTransaction()
        await session.endSession()
        throw new Error('Delete failed')
    }
}

export const ImageUploadServices = { uploadImageIntoDB, getAllImagesFromDB, deleteImagesFromDB }



