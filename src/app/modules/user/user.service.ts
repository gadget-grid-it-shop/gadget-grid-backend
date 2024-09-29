import { Document, startSession } from "mongoose";
import { TUser } from "./user.interface";
import { User } from "./user.model";
import { TAdmin } from "../admin/admin.interface";
import { Admin } from "../admin/admin.model";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const createUserIntoDB = async (admin: TAdmin) => {

    const user: TUser = {
        email: admin.email,
        password: admin.password,
        role: admin.role
    }


    if (await User.isUserExistsByEmail(admin.email)) {
        throw new AppError(httpStatus.CONFLICT, 'User already exists. Try signing in')
    }

    const session = await startSession()

    try {
        session.startTransaction()

        const userRes = await User.create(user)

        if (!userRes) {
            throw new AppError(httpStatus.CONFLICT, 'failed to create user')
        }

        admin.user = userRes._id

        const adminRes = await Admin.create(admin)

        if (!adminRes) {
            throw new AppError(httpStatus.CONFLICT, 'failed to create user')
        }

        await session.commitTransaction()
        await session.endSession()
        return adminRes
    }
    catch (err) {
        await session.abortTransaction()
        await session.endSession()
    }
}


export const UserServices = {
    createUserIntoDB
}