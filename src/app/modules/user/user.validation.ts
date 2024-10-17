import { z } from "zod";

const createUserValidationSchema = z.object({
    email: z.string({ required_error: 'User name is required' }).email('Not a valid email'),
    password: z.string({ required_error: 'Password is required', invalid_type_error: 'Password must be a string' })
        .min(6, 'Password must be at least 6 characters'),
    role: z.string({
        required_error: 'User role is required'
    }).min(1, "Role cannot be empty string")
})


export const UserValidations = {
    createUserValidationSchema
}