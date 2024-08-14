import {z} from "zod";

const createCategoryValidationSchema = z.object({
  name: z
    .string({
      required_error: "Category name is required",
      invalid_type_error: "Category name should be a string",
    })
    .toLowerCase(),
  parent_id: z
    .string({
      invalid_type_error: "Parent categroy id should be a string",
    })
    .optional(),
  product_details_categories: z
    .array(z.string(), {
      required_error: "Product details category is required",
      invalid_type_error: "Product details category should be an array of strings",
    })
    .min(1, "A category should have at least one product details category"),
});
