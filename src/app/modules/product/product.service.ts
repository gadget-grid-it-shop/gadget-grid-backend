import { TProduct } from "./product.interface";
import { Product } from "./product.model";

const createProductIntoDB = async (payload: TProduct) => {

    const productData = payload

    if (payload.discount && payload.discount?.value > 0) {

        console.log('condition works')
        if (payload.discount.type === 'flat') {
            const discount = payload.price - payload.discount.value
            productData.special_price = Math.round(discount)
            console.log(discount)
            console.log(productData)
        }
        else {
            const discount = payload.price - Math.floor(payload.price * payload.discount.value / 100)
            productData.special_price = Math.round(discount)
        }
    }

    // console.log(productData)

    const result = await Product.create(productData)

    return result
}

const getAllProductsFromDB = async () => {
    const result = await Product.find()

    return result
}

export const ProductServices = {
    createProductIntoDB,
    getAllProductsFromDB
}
