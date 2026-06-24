import { z } from "zod";

const attributeOptionSchema = z.object({
  id: z.string({ required_error: "Option id is required" }),
  isColor: z.boolean().optional(),
  value: z.string({ required_error: "Option value is required" }),
  color: z.string().optional(),
});

export const createAttributeValidationSchema = z.object({
  title: z.string({ required_error: "Attribute title is required" }),
  options: z.array(attributeOptionSchema).optional(),
});

export const updateAttributeValidationSchema = z.object({
  title: z.string().optional(),
  options: z.array(attributeOptionSchema).optional(),
});

export const AttributeValidations = {
  createAttributeValidationSchema,
  updateAttributeValidationSchema,
};
