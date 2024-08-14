import {model, Schema} from "mongoose";
import {TCategory} from "./category.interface";

const CategorySchema = new Schema<TCategory>({
  name: {
    type: String,
    required: [true, "Category name is required"],
    lowercase: true,
  },
  parent_id: {
    type: String,
    default: null,
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
});

CategorySchema.virtual("subCategories", {
  ref: "Category", // Reference the same collection
  localField: "_id", // Match the _id of the current document
  foreignField: "parent_id", // to the parent_id of the other documents
  justOne: false, // Since there can be multiple subcategories
});

CategorySchema.set("toJSON", {virtuals: true});
CategorySchema.set("toObject", {virtuals: true});

CategorySchema.index({name: 1}, {unique: true, collation: {locale: "en", strength: 2}});

export const Category = model<TCategory>("Category", CategorySchema);
