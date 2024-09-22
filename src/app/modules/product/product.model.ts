import { model, Schema } from "mongoose";
import { TMeta, TProduct, TProductCategory, TReview } from "./product.interface";

const ProductCategorySchema = new Schema<TProductCategory>({
    main: { type: Boolean, required: [true, 'Main category flag is required'], default: false },
    id: { type: String, required: [true, 'Category ID is required'], }
});

// const ReviewSchema = new Schema<TReview>({
//     rating: { type: Number, required: [true, 'Review rating is required'] },
//     review: { type: String, required: [true, 'Review text is required'] }
// });

const MetaSchema = new Schema<TMeta>({
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' }
});

const DiscountSchema = new Schema({
    type: {
        type: String, // The type of discount (e.g., 'flat' or 'percent')
        enum: ['flat', 'percent'], // The allowed values for the discount type
        default: 'flat' // Default value
    },
    value: {
        type: Number, // The numeric value for the discount
        default: 0 // Default discount value
    },
})

const ProductSchema = new Schema<TProduct>({
    id: { type: String, required: [true, 'Product ID is required'] },
    name: { type: String, required: [true, 'Product title is required'] },
    price: { type: Number, required: [true, 'Product price is required'] },
    special_price: { type: Number },
    discount: {
        type: DiscountSchema,
        required: [true, 'Discount is required'] // Validation for discount
    },
    sku: { type: String, required: [true, 'Product SKU is required'], unique: true },
    brand: { type: String, required: [true, 'Product brand is required'] },
    model: { type: String, default: "" },
    warranty: { type: String, required: [true, 'Product warranty is required'] },
    // reviews: [ReviewSchema],
    key_features: { type: String, required: [true, 'Key features are required'] },
    quantity: { type: Number, required: [true, 'Product quantity is required'], default: 0 },
    category: {
        type: [ProductCategorySchema],
        required: [true, 'At least one product category is required']
    },
    description: { type: String, required: [true, 'Product description is required'] },
    videos: [{ type: String, default: "" }],
    gallery: [{ type: String, default: "" }],
    thumbnail: { type: String, required: [true, 'Product thumbnail is required'] },
    slug: { type: String, required: [true, 'Product slug is required'] },
    attributes: [
        {
            name: { type: String },
            fields: { type: Map, of: String }
        }
    ],
    meta: {
        type: MetaSchema,
        required: [true, 'Meta information is required']
    },
    tags: [{ type: String, default: "" }],
    isFeatured: { type: Boolean, default: false },
    sales: { type: Number, default: 0 },
    createdBy: { type: String, required: [true, 'Creator information is required'] },
}, { timestamps: true });


export const Product = model<TProduct>('Product', ProductSchema)