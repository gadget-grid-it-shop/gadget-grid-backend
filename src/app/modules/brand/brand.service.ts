import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TBrand } from "./brand.interface";
import { Brand } from "./brand.model";
import { User } from "../user/user.model";
import { TUser } from "../user/user.interface";

const createBrandIntoDB = async (payload: TBrand, email: string) => {
    const exists = await Brand.findBrandByName(payload.name)
    const user: TUser | null = await User.findOne({ email })

    if (exists) {
        throw new AppError(httpStatus.CONFLICT, 'Brand already exists')
    }

    const result = await Brand.create({ ...payload, createdBy: user?._id })

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
    const result = await Brand.find({ isDeleted: false }).populate([
        {
            path: 'createdBy',
            select: 'email name'
        }
    ])

    return result
}


const deleteBrandFromDB = async (id: string) => {
    const exists = await Brand.findBrandById(id)

    if (!exists) {
        throw new AppError(httpStatus.CONFLICT, 'Brand does not exists')
    }

    const result = await Brand.findByIdAndUpdate(id, { isDeleted: true }, { new: true })

    return result
}



export const BrandService = {
    createBrandIntoDB,
    updateBrandIntoDB,
    getAllBrandsFromDB,
    deleteBrandFromDB
}