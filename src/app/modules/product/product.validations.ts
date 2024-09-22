import { z } from "zod";

// Define the product category schema
const ProductCategorySchema = z.object({
    main: z.boolean({ required_error: "Main category flag is required" }),
    id: z.string({ required_error: "Category ID is required" })
});

// const ReviewSchema = z.object({
//     rating: z.number({ required_error: "Review rating is required" }),
//     review: z.string({ required_error: "Review text is required" })
// });

const MetaSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional()
});

// Define the main product schema
export const createProductValidationSchema = z.object({
    id: z.string({ required_error: "Product ID is required" }),
    title: z.string({ required_error: "Product title is required" }),
    product_price: z.number({ required_error: "Product price is required" }),
    discount: z.array(z.object({
        type: z.string().optional(),
        value: z.number().optional()
    })).optional(),
    product_SKU: z.string({ required_error: "Product SKU is required" }),
    brand: z.string({ required_error: "Product brand is required" }),
    model: z.string().optional(),
    warranty: z.string({ required_error: "Product warranty is required" }),
    // reviews: z.array(ReviewSchema).optional(),
    key_features: z.string({ required_error: "Key features are required" }),
    quantity: z.number({ required_error: "Product quantity is required" }),
    category: z.array(ProductCategorySchema).min(1, "At least one product category is required"),
    description: z.string({ required_error: "Product description is required" }),
    videos: z.array(z.string()).optional(),
    gallery: z.array(z.string()).optional(),
    thumbnail: z.string({ required_error: "Product thumbnail is required" }),
    slug: z.string({ required_error: "Product slug is required" }),
    attributes: z.record(z.string()).optional(),
    meta: MetaSchema.optional(),
    tags: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
    sales: z.number().optional(),
    createdBy: z.string({ required_error: "Creator information is required" })
});