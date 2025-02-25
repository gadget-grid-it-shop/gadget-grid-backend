"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidations = void 0;
const zod_1 = require("zod");
const createUserValidationSchema = zod_1.z.object({
    email: zod_1.z.string({ required_error: 'User name is required' }).email('Not a valid email'),
    password: zod_1.z.string({ required_error: 'Password is required', invalid_type_error: 'Password must be a string' })
        .min(6, 'Password must be at least 6 characters'),
    role: zod_1.z.string({
        required_error: 'User role is required'
    }).min(1, "Role cannot be empty string")
});
exports.UserValidations = {
    createUserValidationSchema
};
