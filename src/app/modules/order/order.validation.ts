import z from "zod";

const addressSchema = z.object({
  address: z.string().min(1, "Address is required").trim(),
  city: z.string().min(1, "City is required").trim(),
  district: z.string().min(1, "District is required").trim(),
});

const productSchema = z.object({
  id: z.string().min(1, "District is required").trim(),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

const createOrderValidationSchema = z.object({
  products: z
    .array(productSchema)
    .min(1, "At least one product is required")
    .refine((products) => {
      // Check for duplicate product IDs
      const ids = products.map((p) => p.id.toString());
      return new Set(ids).size === ids.length;
    }, "Duplicate products are not allowed"),
  billingAddress: addressSchema,
  shippingAddress: addressSchema,
  paymentMethod: z.enum(["card", "paypal", "bank_transfer", "cod"], {
    errorMap: () => ({ message: "Invalid payment method" }),
  }),
  shippingMethod: z.enum(["standard", "express", "overnight"], {
    errorMap: () => ({ message: "Invalid shipping method" }),
  }),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  saveAddress: z.boolean().optional(),
});

const orderValidations = {
  createOrderValidationSchema,
};

export default orderValidations;
