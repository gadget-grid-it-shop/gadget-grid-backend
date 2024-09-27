import { z } from "zod";
import { EAppFeatures } from "./roles.interface";

const TCrudSchema = z.object({
    read: z.boolean().default(false),
    create: z.boolean().default(false),
    update: z.boolean().default(false),
    delete: z.boolean().default(false)
});

const TPermissionSchema = z.object({
    feature: z.nativeEnum(EAppFeatures),
    access: TCrudSchema
})

const createRoleValidationSchema = z.object({
    role: z.string().min(1, 'Role is required'),
    permissions: z.array(TPermissionSchema).optional()
})


export const RolesValidations = {
    createRoleValidationSchema
}