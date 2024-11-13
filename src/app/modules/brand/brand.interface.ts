import { Model } from "mongoose"

export type TBrand = {
    _id: string,
    name: string,
    image: string,
    isDeleted: boolean,
    isActive: boolean
}

export interface TBrandModel extends Model<TBrand> {
    findBrandByName(name: string): Promise<boolean>,
    findBrandById(id: string): Promise<TBrand | undefined>
}
