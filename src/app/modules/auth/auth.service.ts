import httpStatus from "http-status";
import config from "../../config";
import AppError from "../../errors/AppError";
import {User} from "../user/user.model";
import {TLoginCredentials} from "./auth.interface";
import jwt, {JwtPayload} from "jsonwebtoken";
import {createToken, generateResetPassHtml} from "./auth.utils";
import {Admin} from "../admin/admin.model";
import {sendEmail} from "../../utils/sendEmail";

const adminLoginFromDB = async (payload: TLoginCredentials) => {
  const userExist = await User.isUserExistsByEmail(payload.email);

  if (!userExist) {
    throw new AppError(httpStatus.CONFLICT, "User does not exist");
  }

  if (userExist.isVarified === false) {
    throw new AppError(httpStatus.CONFLICT, "Please verify you email first, a verification code has been sent to your email");
  }

  const matchPassword = await User.matchUserPassword(payload.password, userExist.password);

  if (!matchPassword) {
    throw new AppError(httpStatus.CONFLICT, "Wrong password");
  }

  const jwtPayload = {
    userRole: userExist.role,
    email: userExist.email,
  };

  console.log(jwtPayload);

  const accessToken = createToken({payload: jwtPayload, secret: config.access_secret as string, expiresIn: config.access_token_expires_in as string});
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

  const decoded = jwt.verify(token, config.refresh_secret as string) as JwtPayload;

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

  const accessToken = createToken({payload, secret: config.access_secret as string, expiresIn: config.access_token_expires_in as string});

  return {
    accessToken,
  };
};

const forgotPasswordService = async (email: string) => {
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User does not exist");
  }

  if (!user.isVarified) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Your email is not varified. please varify you email first");
  }

  const jwtPayload = {
    userRole: user.role,
    email: user.email,
  };

  const resetToken = createToken({payload: jwtPayload, secret: config.access_secret as string, expiresIn: "10m"});

  const resetUILink = `${config.client_url}/email=${user.email}&token=${resetToken}`;
  const mailBody = generateResetPassHtml(resetUILink);

  await sendEmail(user.email, mailBody);
};

const resetPasswordService = async (email: string, password: string, token: string | undefined) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized", "unauthorized access request");
  }
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User does not exist");
  }
};

const getMyDataFromDB = async (email: string) => {
  const result = await Admin.findOne({email}).populate([
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
};
