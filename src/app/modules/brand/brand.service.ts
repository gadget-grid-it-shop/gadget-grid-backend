import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TBrand } from "./brand.interface";
import { Brand } from "./brand.model";

const createBrandIntoDB = async (payload: TBrand) => {
    const exists = await Brand.findBrandByName(payload.name)

    if (!exists) {
        throw new AppError(httpStatus.CONFLICT, 'Brand already exists')
    }

    const result = await Brand.create(payload)

    return result
}



export const BrandService = {
    createBrandIntoDB
}