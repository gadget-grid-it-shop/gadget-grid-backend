import {z} from "zod";

const refreshTokenValidationSchema = z.object({
  refreshToken: z.string({required_error: "Refresh token is required"}),
});

const forgotPassValidatioSchema = z.object({
  email: z.string({required_error: "Id is required"}),
});

export const authValidations = {
  refreshTokenValidationSchema,
  forgotPassValidatioSchema,
};
