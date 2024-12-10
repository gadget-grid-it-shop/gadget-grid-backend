import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { TProduct } from "./product.interface";
import { Product } from "./product.model";
import { TUser } from "../user/user.interface";
import slugify from "slugify";
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

const createProductIntoDB = async (payload: TProduct, email: string) => {

    const user: TUser | undefined = await User.isUserExistsByEmail(email)

    if (!user._id) {
        throw new AppError(httpStatus.CONFLICT, 'Could not find admin information')
    }

    const slug = slugify(payload.name)

    const productData = payload
    productData.createdBy = user._id
    productData.slug = slug

    if (payload.discount && payload.discount?.value > 0) {

        if (payload.discount.type === 'flat') {
            const discount = payload.price - payload.discount.value
            productData.special_price = Math.round(discount)
        }
        else {
            const discount = payload.price - Math.floor(payload.price * payload.discount.value / 100)
            productData.special_price = Math.round(discount)
        }
    }


    const result = await Product.create(productData)

    return result
}

const getAllProductsFromDB = async () => {
    const result = await Product.find().populate([
        {
            path: 'createdBy',
        },
        {
            path: 'brand',
            select: 'name image'
        },
        {
            path: 'category.id',
            model: 'Category',
            // match: { main: true },
            select: 'name'
        }
    ])

    return result
}


const bulkUploadToDB = async (file: Express.Multer.File | undefined) => {
    if (!file) {
        throw new AppError(httpStatus.CONFLICT, 'No upload file provided')
    }

    const filePath = path.resolve(file.path)

    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(filePath)

        Papa.parse(fileStream, {
            header: true,
            skipEmptyLines: true,
            complete: async (result) => {
                const { data, errors } = result

                if (errors.length > 0) {
                    reject(new AppError(httpStatus.CONFLICT, 'Failed to read file'))
                    return
                }


            }
        })
    })

}

export const ProductServices = {
    createProductIntoDB,
    getAllProductsFromDB,
    bulkUploadToDB
}
