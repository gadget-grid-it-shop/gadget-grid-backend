import { model, Schema } from "mongoose";
import { EAppFeatures, TPermission, TRole } from "./roles.interface";

const PermissionsSchema = new Schema<TPermission>({
    feature: {
        type: String,
        enum: Object.values(EAppFeatures),
        required: [true, 'Feature name is required'],
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
    permissions: {
        type: [PermissionsSchema],
        default: Object.values(EAppFeatures).map(feature => ({
            feature: feature,
            access: {
                read: false,
                create: false,
                update: false,
                delete: false
            }
        }))
    }
})


RolesSchema.pre('save', function (next) {
    const role = this as TRole

    const defaultPermissions: TPermission[] = Object.values(EAppFeatures).map(feature => ({
        feature: feature,
        access: {
            read: false,
            create: false,
            update: false,
            delete: false
        }
    }));

    const modifiedPermissions = defaultPermissions.map(dPermission => {
        const providedPermission = role.permissions.find(p => p.feature === dPermission.feature)

        return providedPermission ? providedPermission : dPermission
    })

    role.permissions = modifiedPermissions
    next()
})


export const Roles = model<TRole>('Roles', RolesSchema)