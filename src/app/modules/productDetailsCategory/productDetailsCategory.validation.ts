import {z} from "zod";

const createProductDetailsCategoryValidationSchema = z.object({
  name: z.string({
    required_error: "product details category name is required",
    invalid_type_error: "product details category name should be a string",
  }),
  fields: z
    .string({
      required_error: "At least one field is required",
      invalid_type_error: "Fields should be an array of objects",
    })
    .array()
    .min(1),
});

export const ProductDetailsCategoryValidations = {
  createProductDetailsCategoryValidationSchema,
};
