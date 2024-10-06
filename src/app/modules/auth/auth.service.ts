import httpStatus from "http-status";
import config from "../../config";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { TLoginCredentials } from "./auth.interface";
import jwt, { JwtPayload } from "jsonwebtoken";
import { createToken, generateResetPassHtml, generateVerifyEmailHtml } from "./auth.utils";
import { Admin } from "../admin/admin.model";
import { sendEmail } from "../../utils/sendEmail";
import bcrypt from "bcrypt";
import varifyToken from "../../utils/verifyToken";

const adminLoginFromDB = async (payload: TLoginCredentials) => {
  const userExist = await User.isUserExistsByEmail(payload.email);

  if (!userExist) {
    throw new AppError(httpStatus.CONFLICT, "User does not exist");
  }

  const matchPassword = await User.matchUserPassword(payload.password, userExist.password);

  if (!matchPassword) {
    throw new AppError(httpStatus.CONFLICT, "Wrong password");
  }

  const jwtPayload = {
    // userRole: userExist.role,
    email: userExist.email,
  };

  console.log(jwtPayload);

  const accessToken = createToken({ payload: jwtPayload, secret: config.access_secret as string, expiresIn: config.access_token_expires_in as string });
  const refreshToken = createToken({
    payload: jwtPayload,
    secret: config.refresh_secret as string,
    expiresIn: config.refresh_token_expires_in as string,
  });

  return {
    accessToken,
    refreshToken,
    isVarified: userExist.isVarified,
  };
};

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized", "unauthorized access request");
  }

  const decoded = varifyToken(token, config.refresh_secret as string);

  if (!decoded) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized", "unauthorized access request");
  }

  const user = await User.isUserExistsByEmail(decoded.email);

  if (user.isDeleted) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Your account was deleted", "unauthorized access request");
  }

  if (!user.isActive) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Your account is blocked", "unauthorized access request");
  }

  const payload = {
    userRole: user.role,
    email: user.email,
  };

  const accessToken = createToken({ payload, secret: config.access_secret as string, expiresIn: config.access_token_expires_in as string });

  return {
    accessToken,
  };
};

const forgotPasswordService = async (email: string) => {
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User does not exist");
  }

  const jwtPayload = {
    email: user.email,
  };

  const resetToken = createToken({ payload: jwtPayload, secret: config.access_secret as string, expiresIn: "60m" });

  const admin = await Admin.findOne({ user: user._id });

  const resetUILink = `${config.client_url}/reset-password/email=${user.email}&token=${resetToken}`;
  const mailBody = generateResetPassHtml(resetUILink, admin?.name);

  await sendEmail(user.email, mailBody, "Reset your password");
};



const resetPasswordService = async (email: string, password: string, token: string | undefined) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized", "unauthorized access request");
  }
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User does not exist");
  }

  const decoded = varifyToken(token, config.access_secret as string);

  console.log(decoded);

  if (email !== decoded.email) {
    throw new AppError(httpStatus.FORBIDDEN, "Wrong email");
  }

  const hashPassword = await bcrypt.hash(password, Number(config.bcrypt_hash_rounds));

  const updatePasswordRes = await User.findOneAndUpdate({ email }, { password: hashPassword }).select("-password");

  return updatePasswordRes;
};




const SendVerificationEmailService = async (email: string) => {
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User does not exist");
  }

  if (user.isVarified) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User already verified. Please try signing in.");
  }

  const jwtPayload = {
    email: user.email,
  };

  const verificationToken = createToken({ payload: jwtPayload, secret: config.verify_secret as string, expiresIn: "10m" });

  const admin = await Admin.findOne({ user: user._id });

  const verifyUILink = `${config.client_url}/verify-email/email=${user.email}&token=${verificationToken}`;
  const mailBody = generateVerifyEmailHtml(verifyUILink, admin?.name);

  await sendEmail(user.email, mailBody, "Verify your email");
};



const verifyEmailService = async (email: string, token: string | undefined) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized", "unauthorized access request");
  }
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User does not exist");
  }

  if (user.isVarified) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are already verified. Please try signing in.");
  }

  const decoded = varifyToken(token, config.verify_secret as string);

  if (email !== decoded.email) {
    throw new AppError(httpStatus.FORBIDDEN, "Wrong email");
  }

  const verifiedUser = await User.findOneAndUpdate({ email }, { isVarified: true }).select("-password");

  return verifiedUser;
};



const updatePasswordService = async (newPassword: string, currentPassword: string, email: string) => {


  const user = await User.isUserExistsByEmail(email)

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User does not exist");
  }

  const matchPassword = await User.matchUserPassword(currentPassword, user.password)

  if (!matchPassword) {
    throw new AppError(httpStatus.CONFLICT, 'Password does not match')
  }

  const password = await bcrypt.hash(newPassword, Number(config.bcrypt_hash_rounds))

  const updated = await User.updateOne({ email: user.email }, { password }).select('-password')

  return updated

}


const getMyDataFromDB = async (email: string) => {
  const result = await Admin.findOne({ email }).populate([
    {
      path: "user",
      select: "-password",
    },
    {
      path: "role",
    },
  ]);

  return result;
};

export const AuthServices = {
  adminLoginFromDB,
  refreshToken,
  getMyDataFromDB,
  forgotPasswordService,
  resetPasswordService,
  SendVerificationEmailService,
  verifyEmailService,
  updatePasswordService
};
