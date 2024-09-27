import { model, Schema } from "mongoose";
import { TUser } from "./user.interface";
import bcrypt from 'bcrypt';
import config from "../../config";

const UserSchema = new Schema<TUser>({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        required: [true, "Role is required"],
        default: 'customer',
        ref: 'Roles'
    },
    isVarified: {
        type: Boolean,
        default: false
    }
})

UserSchema.pre('save', async function (next) {
    const user = this

    user.password = await bcrypt.hash(user.password, Number(config.bcrypt_hash_rounds))

    next()
})

UserSchema.post('save', async function (doc, next) {
    doc.password = ''
    next()
})


export const User = model<TUser>('User', UserSchema)