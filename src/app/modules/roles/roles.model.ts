import { model, Schema } from "mongoose";
import { EAppFeatures, TPermission, TRole } from "./roles.interface";

const PermissionsSchema = new Schema<TPermission>({
    feature: {
        type: String,
        enum: Object.values(EAppFeatures),
        required: [true, 'Feature name is required']
    },
    access: {
        read: {
            type: Boolean,
            default: false
        },
        create: {
            type: Boolean,
            default: false
        },
        update: {
            type: Boolean,
            default: false
        },
        delete: {
            type: Boolean,
            default: false
        }
    }
})

const RolesSchema = new Schema<TRole>({
    role: {
        type: String,
        required: [true, 'Role is required'],
        unique: true
    },
    permissions: [PermissionsSchema]
})


export const Roles = model<TRole>('Roles', RolesSchema)