import { Model, model, Schema } from "mongoose";
import { TBrand } from "./brand.interface";

const brandSchema = new Schema<TBrand>({
    image: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: [true, 'Name is required']
    }
})

export interface TBrandModel extends Model<TBrand> {
    findBrandByName(name: string): Promise<boolean>
}

brandSchema.statics.findBrandByName = async (name: string) => {
    const exists = await Brand.findOne({ name })

    if (!exists) {
        return false
    }
    else if (exists.isDeleted) {
        return false
    }
    else {
        return true
    }
}

export const Brand = model<TBrand, TBrandModel>('Brand', brandSchema)