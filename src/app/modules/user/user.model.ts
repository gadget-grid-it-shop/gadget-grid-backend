import { model, Schema } from "mongoose";
import { TUser, TUserModel } from "./user.interface";
import bcrypt from 'bcrypt';
import config from "../../config";
import { boolean } from "zod";

const UserSchema = new Schema<TUser, TUserModel>({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
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
    },
    isMasterAdmin: {
        type: Boolean,
    },
    passwordChangedAt: {
        type: String
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


// ================== static methods ==================
UserSchema.statics.isUserExistsByEmail = async function (email: string) {
    return await User.findOne({ email })
}


UserSchema.statics.isUserVarified = async function (email: string) {
    const exist = await User.isUserExistsByEmail(email)
    if (exist) {
        return exist.isVarified
    }
    else {
        return false
    }
}


UserSchema.statics.findUserRoleByEmail = async function (email: string) {
    const exist = await User.isUserExistsByEmail(email)

    if (exist) {
        return exist.role
    }
    else {
        return null
    }
}

UserSchema.statics.matchUserPassword = async function (userPassword, databasePassword) {
    return await bcrypt.compare(userPassword, databasePassword)
}


export const User = model<TUser, TUserModel>('User', UserSchema)