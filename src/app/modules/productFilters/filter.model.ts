import { model, Schema } from "mongoose";
import { TFilterModel, TProductFilter } from "./filter.interface";

const FilterSchema = new Schema<TProductFilter>({
    title: {
        type: String,
        required: [true, 'Filter Title is required'],
        unique: true
    },
    attributes: {
        type: [String],
        required: [true, 'Add at least one attribute']
    }
},
    {
        timestamps: true
    })

FilterSchema.statics.findFilterById = async function (id: string) {
    const result = await ProductFilter.findById(id)

    return result
}

const ProductFilter = model<TProductFilter, TFilterModel>('ProductFilter', FilterSchema)

export default ProductFilter