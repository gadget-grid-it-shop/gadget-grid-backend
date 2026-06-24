import z from "zod";

const addressSchema = z.object({
  address: z
    .string({ required_error: "Address is required" })
    .min(1, "Address is required")
    .trim(),
  area: z
    .string({ required_error: "Area is required" })
    .min(1, "Area is required")
    .trim(),
  district: z
    .string({ required_error: "District is required" })
    .min(1, "District is required")
    .trim(),
});

const variantOptionSchema = z.object({
  id: z.string(),
  isColor: z.boolean().optional(),
  value: z.string(),
  color: z.string().optional(),
});

const productSchema = z.object({
  id: z
    .string({ required_error: "Product ID is required" })
    .min(1, "Product ID is required")
    .trim(),
  quantity: z
    .number({ required_error: "Quantity is required" })
    .int()
    .positive("Quantity must be a positive integer"),
  selectedVariant: z.record(z.string(), z.union([z.string(), variantOptionSchema])).optional(),
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
  shippingAddress: addressSchema.optional(),
  paymentMethod: z.enum(["card", "paypal", "bank_transfer", "cod"], {
    errorMap: () => ({ message: "Invalid payment method" }),
  }),
  shippingMethod: z.enum(["inside", "outside"], {
    errorMap: () => ({ message: "Invalid shipping method" }),
  }),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  saveAddress: z.boolean().optional(),
  userName: z.string({ required_error: "User name is required" }).min(1, "User name is required"),
});

const getCartPriceDataValidationSchema = z.object({
  products: z
    .array(productSchema)
    .min(1, "At least one product is required")
    .refine((products) => {
      // Check for duplicate product IDs
      const ids = products.map((p) => p.id.toString());
      return new Set(ids).size === ids.length;
    }, "Duplicate products are not allowed"),
  paymentMethod: z.enum(["card", "paypal", "bank_transfer", "cod"], {
    errorMap: () => ({ message: "Invalid payment method" }),
  }),
});

const OrderStatusEnum = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
]);

const PaymentStatusEnum = z.enum(["pending", "paid", "failed", "refunded"]);
const PaymentMethodEnum = z.enum(["card", "paypal", "bank_transfer", "cod"]);
const ShippingMethodEnum = z.enum(["inside", "outside"]);

const AdminUpdateOrderSchema = z
  .object({
    currentStatus: OrderStatusEnum.optional(),
    paymentStatus: PaymentStatusEnum.optional(),
    paymentMethod: PaymentMethodEnum.optional(),
    shippingMethod: ShippingMethodEnum.optional(),
    trackingNumber: z
      .string()
      .regex(/^[A-Z0-9-]{5,50}$/i, "Invalid tracking number format")
      .optional()
      .or(z.literal("").transform(() => undefined)),

    adminNotes: z
      .string()
      .max(500, "Notes too long (max 500 chars)")
      .optional()
      .or(z.literal("").transform(() => undefined)),

    // Addresses — at least one field must change or be provided
    shippingAddress: addressSchema.optional(),

    billingAddress: addressSchema.optional().nullable(), // can be null = same as shipping

    // Optional: allow partial updates
  })
  .refine(
    (data) => {
      // At least one field must be provided for update
      const hasUpdate = Object.values(data).some(
        (value) =>
          value !== undefined &&
          value !== null &&
          (typeof value !== "object" || Object.keys(value).length > 0),
      );
      return hasUpdate;
    },
    {
      message: "At least one field must be provided to update the order",
    },
  );

// TypeScript type from schema
export type TAdminUpdateOrderPayload = z.infer<typeof AdminUpdateOrderSchema>;

const orderValidations = {
  createOrderValidationSchema,
  AdminUpdateOrderSchema,
  getCartPriceDataValidationSchema,
};

export default orderValidations;
