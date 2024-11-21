import mongoose, { startSession, Types } from "mongoose";
import { TUser } from "./user.interface";
import { User } from "./user.model";
import { TAdmin } from "../admin/admin.interface";
import { Admin } from "../admin/admin.model";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { Roles } from "../roles/roles.model";
import { ObjectId } from 'mongodb'

const createAdminIntoDB = async (admin: TAdmin) => {

  delete admin.isDeleted

  const user: TUser = {
    email: admin.email,
    password: admin.password,
    role: admin.role
  };

  const roleExist = await Roles.findById(admin.role);

  if (!roleExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Role does not exist");
  }



  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const adminExist = await User.isUserExistsByEmail(admin.email)

    if (adminExist) {
      const deletedAdmin = await Admin.findOneAndDelete({ email: admin.email })

      if (!deletedAdmin) {
        throw new AppError(httpStatus.CONFLICT, "failed to create user");
      }

      const deleteUser = await User.findOneAndDelete({ email: admin.email })

      if (!deleteUser) {
        throw new AppError(httpStatus.CONFLICT, "failed to create user");
      }
    }

    const userRes = await User.create(user);

    if (!userRes) {
      throw new AppError(httpStatus.CONFLICT, "failed to create user");
    }

    admin.user = userRes._id;

    const adminRes = await Admin.create(admin);

    if (!adminRes) {
      throw new AppError(httpStatus.CONFLICT, "failed to create Admin");
    }

    await session.commitTransaction();
    await session.endSession();
    return adminRes;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.CONFLICT, err instanceof AppError ? err?.message : "Failed to create user");
  }
};

const getAllAdminsFromDB = async () => {
  const result = await Admin.find({ isDeleted: false }).populate([
    {
      path: 'user',
      select: '-password'
    },
    {
      path: 'role',
      select: 'role isDeleted -_id'
    }
  ])

  return result
}


const getSingleUserFromDB = async (id: string, query: Record<string, unknown>) => {

  const userType: 'admin' | 'customer' | unknown = query?.userType

  if (!userType) {
    throw new AppError(httpStatus.CONFLICT, 'User type is required')
  }

  if (userType !== 'admin' && userType !== 'customer') {
    throw new AppError(httpStatus.CONFLICT, 'Wrong user type')
  }

  const model = userType === 'admin' ? Admin : userType === 'customer' ? Admin : undefined


  const userData = await model?.findById(id).populate([
    {
      path: 'user',
      select: '-password'
    },
    {
      path: 'role',
      select: 'role isDeleted -_id'
    }
  ])


  if (!userData) {
    throw new AppError(httpStatus.CONFLICT, 'Failed to get user data')
  }

  if (userData.isDeleted) {
    throw new AppError(httpStatus.CONFLICT, 'User was deleted')
  }

  return userData
}


const deleteUserFromDB = async (userId: string, role: 'admin' | 'customer', authUserEmail: string) => {
  if (!userId) {
    throw new AppError(httpStatus.CONFLICT, 'User not found')
  }

  const user: TUser | null = await User.findById(userId)

  if (user?.email === authUserEmail) {
    throw new AppError(httpStatus.CONFLICT, "You can't delete your own account")
  }

  const session = await startSession()

  try {

    session.startTransaction()
    const deletedUser = await User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true })
    if (!deletedUser) {
      throw new AppError(httpStatus.CONFLICT, 'Failed to delete user')
    }

    if (role === "admin") {
      const deletedAdmin = await Admin.findOneAndUpdate({ user: deletedUser._id }, { isDeleted: true }, { new: true })
      session.commitTransaction()
      session.endSession()
      return deletedAdmin
    }


  } catch (err) {
    await session.abortTransaction()
    await session.endSession()
    if (err instanceof AppError) {
      throw new AppError(err.statusCode, err.message)
    }
    else {
      throw new AppError(httpStatus.CONFLICT, "Failed to delete user")
    }
  }
}

export const UserServices = {
  createAdminIntoDB,
  getAllAdminsFromDB,
  deleteUserFromDB,
  getSingleUserFromDB
};
