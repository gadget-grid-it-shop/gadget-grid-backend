import { model, Schema } from "mongoose";
import { TMeta, TProduct, TProductCategory, TReview } from "./product.interface";

const ProductCategorySchema = new Schema<TProductCategory>({
    main: { type: Boolean, required: [true, 'Main category flag is required'] },
    id: { type: String, required: [true, 'Category ID is required'] }
});

const ReviewSchema = new Schema<TReview>({
    rating: { type: Number, required: [true, 'Review rating is required'] },
    review: { type: String, required: [true, 'Review text is required'] }
});

const MetaSchema = new Schema<TMeta>({
    title: { type: String, required: [true, 'Meta title is required'] },
    description: { type: String, required: [true, 'Meta description is required'] },
    image: { type: String, required: [true, 'Meta image is required'] }
});

const ProductSchema = new Schema<TProduct>({
    id: { type: String, required: [true, 'Product ID is required'] },
    title: { type: String, required: [true, 'Product title is required'], unique: true },
    price: { type: Number, required: [true, 'Product price is required'] },
    discount: {
        type: {
            type: String,
            enum: ['flat', 'percent']
        }
    },
    product_SKU: { type: String, required: [true, 'Product SKU is required'] },
    brand: { type: String, required: [true, 'Product brand is required'] },
    model: { type: String },
    warranty: { type: String, required: [true, 'Product warranty is required'] },
    reviews: [ReviewSchema],
    key_features: { type: String, required: [true, 'Key features are required'] },
    quantity: { type: Number, required: [true, 'Product quantity is required'] },
    category: {
        type: [ProductCategorySchema],
        required: [true, 'At least one product category is required']
    },
    description: { type: String, required: [true, 'Product description is required'] },
    videos: [{ type: String }],
    gallery: [{ type: String }],
    thumbnail: { type: String, required: [true, 'Product thumbnail is required'] },
    slug: { type: String, required: [true, 'Product slug is required'] },
    attributes: { type: Map, of: String },
    meta: {
        type: MetaSchema,
        required: [true, 'Meta information is required']
    },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    sales: { type: Number, default: 0 },
    createdBy: { type: String, required: [true, 'Creator information is required'] },
}, { timestamps: true });


export const Product = model<TProduct>('Product', ProductSchema)