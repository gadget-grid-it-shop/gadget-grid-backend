"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidations = void 0;
const zod_1 = require("zod");
const refreshTokenValidationSchema = zod_1.z.object({
    refreshToken: zod_1.z.string({ required_error: "Refresh token is required" }),
});
const forgotPassValidationSchema = zod_1.z.object({
    email: zod_1.z.string({ required_error: "Email is required" }),
});
const resetPassValidationSchema = zod_1.z.object({
    email: zod_1.z.string({ required_error: "Email is required" }),
    password: zod_1.z
        .string({ required_error: "Password is required", invalid_type_error: "Password must be a string" })
        .min(6, "Password must be at least 6 characters")
        .regex(new RegExp(".*[A-Z].*"), "Password should contain at least one uppercase character"),
});
const updatePassValidationSchema = zod_1.z.object({
    newPassword: zod_1.z
        .string({ required_error: "Password is required", invalid_type_error: "Password must be a string" })
        .min(6, "Password must be at least 6 characters")
        .regex(new RegExp(".*[A-Z].*"), "Password should contain at least one uppercase character"),
    currentPassword: zod_1.z.string({ required_error: 'Current password in required' })
});
exports.authValidations = {
    refreshTokenValidationSchema,
    forgotPassValidationSchema,
    resetPassValidationSchema,
    updatePassValidationSchema
};
