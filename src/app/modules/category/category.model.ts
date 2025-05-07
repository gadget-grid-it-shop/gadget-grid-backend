import { model, Schema } from "mongoose";
import { TCategory } from "./category.interface";

const CategorySchema = new Schema<TCategory>({
  name: {
    type: String,
    required: [true, "Category name is required"],
  },
  parent_id: {
    type: String,
    default: null,
    ref: "Category",
  },
  product_details_categories: {
    type: [String],
    validate: {
      validator: (value: string[]) => {
        return value.length > 0;
      },
      message: "At least one product detail category is required",
    },
    ref: "ProductDetailsCategory",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

export const Category = model<TCategory>("Category", CategorySchema);
