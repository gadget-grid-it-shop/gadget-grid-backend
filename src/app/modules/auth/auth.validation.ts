import { z } from "zod";

const refreshTokenValidationSchema = z.object({
  refreshToken: z.string({ required_error: "Refresh token is required" }),
});

const forgotPassValidationSchema = z.object({
  email: z.string({ required_error: "Email is required" }),
});

const resetPassValidationSchema = z.object({
  email: z.string({ required_error: "Email is required" }),
  password: z
    .string({ required_error: "Password is required", invalid_type_error: "Password must be a string" })
    .min(6, "Password must be at least 6 characters")
    .regex(new RegExp(".*[A-Z].*"), "Password should contain at least one uppercase character"),
});


const updatePassValidationSchema = z.object({
  newPassword: z
    .string({ required_error: "Password is required", invalid_type_error: "Password must be a string" })
    .min(6, "Password must be at least 6 characters")
    .regex(new RegExp(".*[A-Z].*"), "Password should contain at least one uppercase character"),
  currentPassword: z.string({ required_error: 'Current password in required' })
})

export const authValidations = {
  refreshTokenValidationSchema,
  forgotPassValidationSchema,
  resetPassValidationSchema,
  updatePassValidationSchema
};
