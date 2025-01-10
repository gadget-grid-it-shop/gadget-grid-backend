import { Model } from "mongoose"

export type TProductFilter = {
    title: string,
    options: string[]
}

export interface TFilterModel extends Model<TProductFilter> {
    findFilterById: (id: string) => Promise<TProductFilter>
}