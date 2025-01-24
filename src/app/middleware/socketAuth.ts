import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import AppError from "../errors/AppError";
import httpStatus from "http-status";
import varifyToken from "../utils/verifyToken";
import config from "../config";
import { User } from "../modules/user/user.model";
import { Admin } from "../modules/admin/admin.model";

export const ValidateIOAuth = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  const token = socket.handshake.auth["authorization"];

  if (!token) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You are not authorized",
      "unauthorized access request"
    );
  }

  // check if varified user
  const decoded = varifyToken(token, config.access_secret as string);

  if (!decoded) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You are not authorized",
      "unauthorized access request"
    );
  }

  const userExist = await User.isUserExistsByEmail(decoded.email);

  const admin = await Admin.findOne({ email: decoded.email });

  socket.user = {
    userRole: userExist.role,
    email: userExist.email,
    userData: userExist,
    admin: admin,
  };

  next();
};
