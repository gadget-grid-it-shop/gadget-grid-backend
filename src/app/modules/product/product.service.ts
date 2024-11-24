import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { TProduct } from "./product.interface";
import { Product } from "./product.model";
import { TUser } from "../user/user.interface";

const createProductIntoDB = async (payload: TProduct, email: string) => {

    const user: TUser | undefined = await User.isUserExistsByEmail(email)

    if (!user._id) {
        throw new AppError(httpStatus.CONFLICT, 'Could not find admin information')
    }

    const productData = payload
    productData.createdBy = user._id

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
        }
    ])

    return result
}

export const ProductServices = {
    createProductIntoDB,
    getAllProductsFromDB
}
