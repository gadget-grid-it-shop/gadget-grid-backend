import { model, Schema } from "mongoose";
import { TProductFilter } from "./filter.interface";

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
})

const ProductFilter = model<TProductFilter>('ProductFilter', FilterSchema)

export default ProductFilter