import mongoose, { Types } from "mongoose";
import { TUser } from "./user.interface";
import { User } from "./user.model";
import { TAdmin } from "../admin/admin.interface";
import { Admin } from "../admin/admin.model";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { Roles } from "../roles/roles.model";

const createAdminIntoDB = async (admin: TAdmin) => {
  const user: TUser = {
    email: admin.email,
    password: admin.password,
    role: admin.role
  };

  const roleExist = await Roles.findById(admin.role);

  if (!roleExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Role does not exist");
  }

  if (await User.isUserExistsByEmail(admin.email)) {
    throw new AppError(httpStatus.CONFLICT, "User already exists. Try signing in");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

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
  const result = await Admin.find().populate([
    {
      path: 'user',
      select: '-password'
    },
    {
      path: 'role',
      select: 'role -_id'
    }
  ])

  return result
}

export const UserServices = {
  createAdminIntoDB,
  getAllAdminsFromDB
};
