import { z } from "zod";

const AdminNameValidationSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    middleName: z.string().optional().nullable(),
    lastName: z.string().min(1, { message: "Last name is required" }),
});

// Zod schema for TAddress
const AddressValidationSchema = z.object({
    street: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
});

const CreateAdminValidationSchema = z.object({
    address: AddressValidationSchema.optional(),
    email: z.string().email({ message: "Invalid email address" }),
    name: AdminNameValidationSchema,
    role: z.string().min(1, { message: "Role is required" }),
    phoneNumber: z.string().min(1, { message: "Phone number is required" })
});


export const AdminValidations = {
    CreateAdminValidationSchema
}
