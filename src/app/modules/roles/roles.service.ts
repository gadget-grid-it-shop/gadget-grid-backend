import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import {User} from "../user/user.model";
import {EAppFeatures, TPermission, TRole} from "./roles.interface";
import {Roles} from "./roles.model";

const createRoleIntoDB = async (payload: TRole) => {
  const result = await Roles.create(payload);

  return result;
};

const getAllRolesFromDB = async () => {
  const result = await Roles.find({isDeleted: false});

  return result;
};

const updateRoleIntoDB = async (payload: TRole, email: string, id: string) => {
  const ThisUser = await User.isUserExistsByEmail(email);

  if (!ThisUser) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User does not exist");
  }

  if (ThisUser.role === id) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You can't update your own role");
  }

  const thisRole: TRole | null = await Roles.isRoleExist(id);

  if (!thisRole) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Role does not exist");
  }

  const newPermissions: TPermission[] = thisRole?.permissions?.map((permission) => {
    const payloadPermission = payload.permissions.find((p) => p.feature === permission.feature);

    if (payloadPermission) {
      return {
        feature: permission.feature,
        access: {
          read: payloadPermission.access.read ?? permission.access.read,
          create: payloadPermission.access.create ?? permission.access.create,
          update: payloadPermission.access.update ?? permission.access.update,
          delete: payloadPermission.access.delete ?? permission.access.delete,
        },
      };
    } else {
      return {
        feature: permission.feature,
        access: permission.access,
      };
    }
  });
  const result = await Roles.findByIdAndUpdate(
    id,
    {
      role: payload.role,
      description: payload.description,
      $set: {permissions: newPermissions},
    },
    {new: true}
  );

  return result;
};

const deleteRoleFromDB = async (id: string) => {
  const thisRole: TRole | null = await Roles.isRoleExist(id);
  if (!thisRole) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Role does not exist");
  }

  const result = await Roles.findByIdAndUpdate(id, {isDeleted: true}, {new: true});

  return result;
};

export const RolesService = {
  createRoleIntoDB,
  getAllRolesFromDB,
  updateRoleIntoDB,
  deleteRoleFromDB,
};
