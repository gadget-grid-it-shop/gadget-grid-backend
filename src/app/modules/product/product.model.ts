import { model, Schema, Types } from "mongoose";
import {
  TMeta,
  TProduct,
  TProductAttribute,
  TProductCategory,
  TReview,
  TVariant,
  TVariantAttribute,
  TAttributeValue,
} from "./product.interface";

const ProductCategorySchema = new Schema<TProductCategory>({
  main: {
    type: Boolean,
    required: [true, "Main category flag is required"],
    default: false,
  },
  id: {
    type: String,
    required: [true, "Category ID is required"],
    ref: "Category",
  },
});

const MetaSchema = new Schema<TMeta>({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  image: { type: String, default: "" },
});

const DiscountSchema = new Schema({
  type: {
    type: String, // The type of discount (e.g., 'flat' or 'percent')
    enum: ["flat", "percent"], // The allowed values for the discount type
    default: "flat", // Default value
  },
  value: {
    type: Number, // The numeric value for the discount
    default: 0, // Default discount value
  },
});

const AttributeValueSchema = new Schema<TAttributeValue>(
  {
    id: { type: String, required: true },
    isColor: { type: Boolean, default: false },
    color: { type: String },
    value: { type: String, required: true },
  },
  { _id: false },
);

const ProductAttributeSchema = new Schema<TProductAttribute>(
  {
    id: { type: Schema.Types.ObjectId, ref: "Attribute", required: true },
    values: { type: [AttributeValueSchema], default: [] },
  },
  { _id: false },
);

const VariantAttributeSchema = new Schema<TVariantAttribute>(
  {},
  { _id: false, strict: false },
);

const VariantSchema = new Schema<TVariant>(
  {
    attributes: { type: VariantAttributeSchema, default: {} },
    quantity: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    originalPrice: { type: Number, default: 0 },
    thumbnail: { type: String },
  },
  { _id: false },
);

const ProductSchema = new Schema<TProduct>(
  {
    name: { type: String, required: [true, "Product title is required"] },
    price: { type: Number, required: [true, "Product price is required"] },
    special_price: { type: Number },
    discount: {
      type: DiscountSchema,
    },
    sku: {
      type: String,
      required: [true, "Product sku is required"],
      unique: true,
    },
    brand: {
      type: String,
      required: [true, "Product brand is required"],
      ref: "Brand",
    },
    model: { type: String, default: "" },
    supplier: {
      type: String,
      enum: ['iuddokta', 'dropshop', 'gadgetgrid'],
      default: 'gadgetgrid',
    },
    supplierProductLink: { type: String, default: '' },
    warranty: {
      days: { type: Number, default: 0 },
      lifetime: { type: Boolean, default: false },
    },
    key_features: {
      type: String,
      required: [true, "Key features are required"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      default: 0,
    },
    prePayment: {
      hasPrePayment: { type: Boolean, default: false },
      prePaymentAmount: { type: Number, default: 0 },
    },
    category: {
      type: [ProductCategorySchema],
      required: [true, "At least one product category is required"],
      minlength: [1, "At least one category is required"],
    },
    description: { type: String, default: "" },
    videos: [{ type: String, default: "" }],
    gallery: [{ type: String, default: "" }],
    thumbnail: {
      type: String,
      default: "",
    },
    slug: { type: String, required: [true, "Product slug is required"] },
    productType: {
      type: String,
      enum: ["normal", "variant"],
      default: "normal",
    },
    attributes: { type: [ProductAttributeSchema], default: [] },
    variants: { type: [VariantSchema], default: [] },
    meta: {
      type: MetaSchema,
      required: [true, "Meta information is required"],
    },
    tags: [{ type: String, default: "" }],
    isFeatured: { type: Boolean, default: false },
    sales: { type: Number, default: 0 },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    filters: {
      type: [
        {
          filterId: String,
          value: String,
          filter: String,
        },
      ],
      default: [],
    },
    mainCategory: {
      type: Schema.Types.ObjectId,
      required: [true, "Main category is required"],
      ref: "Category",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: [true, "Creator information is required"],
      ref: "User",
    },
    shipping: {
      free: { type: Boolean, default: false },
      cost: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true },
);

ProductSchema.index({ name: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ model: 1 });
ProductSchema.index({ slug: 1 });

ProductSchema.index(
  {
    name: "text",
    model: "text",
  },
  { weights: { name: 10, model: 2 } },
);

export const Product = model<TProduct>("Product", ProductSchema);
