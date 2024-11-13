import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TBrand } from "./brand.interface";
import { Brand } from "./brand.model";

const createBrandIntoDB = async (payload: TBrand) => {
    const exists = await Brand.findBrandByName(payload.name)

    if (exists) {
        throw new AppError(httpStatus.CONFLICT, 'Brand already exists')
    }

    const result = await Brand.create(payload)

    return result
}


const updateBrandIntoDB = async (id: string, payload: Partial<TBrand>) => {
    const exists = await Brand.findBrandById(id)

    if (!exists) {
        throw new AppError(httpStatus.CONFLICT, 'Brand does not exists')
    }

    delete payload.isDeleted

    const result = await Brand.findByIdAndUpdate(id, payload, { new: true })

    return result
}


const getAllBrandsFromDB = async () => {
    const result = await Brand.find()

    return result
}



export const BrandService = {
    createBrandIntoDB,
    updateBrandIntoDB,
    getAllBrandsFromDB
}