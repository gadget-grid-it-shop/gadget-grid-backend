import {z} from "zod";

const refreshTokenValidationSchema = z.object({
  refreshToken: z.string({required_error: "Refresh token is required"}),
});

const forgotPassValidatioSchema = z.object({
  email: z.string({required_error: "Id is required"}),
});

const resetPassValidatioSchema = z.object({
  email: z.string({required_error: "Id is required"}),
  password: z
    .string({required_error: "Password is required", invalid_type_error: "Password must be a string"})
    .min(6, "Password must be at least 6 characters")
    .regex(new RegExp(".*[A-Z].*"), "Password should contain at least one uppercase character"),
});

export const authValidations = {
  refreshTokenValidationSchema,
  forgotPassValidatioSchema,
  resetPassValidatioSchema,
};
