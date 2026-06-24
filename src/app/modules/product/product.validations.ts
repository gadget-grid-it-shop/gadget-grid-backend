import { z } from "zod";

const ProductCategorySchema = z.object({
  main: z.boolean({ required_error: "Main category flag is required" }),
  id: z.string({ required_error: "Category ID is required" }),
});

const MetaSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

const AttributeValueSchema = z.object({
  id: z.string({ required_error: "Value id is required" }),
  isColor: z.boolean().optional(),
  color: z.string().optional(),
  value: z.string({ required_error: "Value is required" }),
});

const NewProductAttributeSchema = z.object({
  id: z.string({ required_error: "Attribute id is required" }),
  values: z.array(AttributeValueSchema).optional(),
});

const OldProductAttributeSchema = z.object({
  name: z.string(),
  fields: z.record(z.string(), z.string()),
});

const ProductAttributeSchema = z.union([NewProductAttributeSchema, OldProductAttributeSchema]);

const VariantAttributeSchema = z.record(z.string(), z.string());

const VariantSchema = z.object({
  attributes: VariantAttributeSchema,
  quantity: z.number({ required_error: "Variant quantity is required" }),
  price: z.number({ required_error: "Variant price is required" }),
  originalPrice: z.number({ required_error: "Variant original price is required" }),
  thumbnail: z.string().optional(),
});

export const createProductValidationSchema = z.object({
  name: z.string({ required_error: "Product name is required" }),
  price: z.number({ required_error: "Product price is required" }),
  discount: z
    .object({
      type: z.string().optional(),
      value: z.number().optional(),
    })
    .optional(),
  sku: z.string({ required_error: "Product SKU is required" }),
  brand: z.string({ required_error: "Product brand is required" }),
  model: z.string().optional(),
  supplier: z.enum(['iuddokta', 'dropshop', 'gadgetgrid']).optional(),
  supplierProductLink: z.string().optional(),
  warranty: z.object({
    days: z.number(),
    lifetime: z.boolean(),
  }),
  key_features: z.string({ required_error: "Key features are required" }),
  quantity: z.number({ required_error: "Product quantity is required" }),
  category: z
    .array(ProductCategorySchema)
    .min(1, "At least one product category is required"),
  description: z.string({ required_error: "Product description is required" }),
  videos: z.array(z.string()).optional(),
  gallery: z.array(z.string()).optional(),
  thumbnail: z.string().optional(),
  productType: z.enum(["normal", "variant"]).optional(),
  attributes: z.array(ProductAttributeSchema).optional(),
  variants: z.array(VariantSchema).optional(),
  meta: MetaSchema.optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  sales: z.number().optional(),
  createdBy: z.string().optional(),
});

export const ProductValidations = {
  createProductValidationSchema,
};
