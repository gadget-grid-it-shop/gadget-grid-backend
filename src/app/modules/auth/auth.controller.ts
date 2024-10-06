import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {TLoginCredentials} from "./auth.interface";
import {AuthServices} from "./auth.service";
import config from "../../config";

const adminLogin = catchAsync(async (req, res) => {
  const payload: TLoginCredentials = req.body;

  const result = await AuthServices.adminLoginFromDB(payload);

  const {refreshToken, accessToken, isVarified} = result;

  res.cookie("refreshToken", refreshToken, {
    secure: config.node_environment !== "development",
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: isVarified ? "Login successfull, welcome back" : "Please varify your email and try again",
    data: {
      accessToken: isVarified ? accessToken : null,
      isVarified,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const {refreshToken} = req.cookies;

  const result = await AuthServices.refreshToken(refreshToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully created new access token",
    data: result,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const {email} = req.body;

  const result = await AuthServices.forgotPasswordService(email);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reset Link is generated successfully",
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const {email, password} = req.body;
  const token = req.headers.authorization;

  const result = await AuthServices.resetPasswordService(email, password, token);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your password was updated successfully",
    data: result,
  });
});

const SendVerificationEmail = catchAsync(async (req, res) => {
  const email = req.body.email;

  const result = await AuthServices.SendVerificationEmailService(email);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "A varificatin mail was sent to your email address. The link will expire in 10 minutes",
    data: result,
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const email = req.body.email;
  const token = req.headers.authorization;

  const result = await AuthServices.verifyEmailService(email, token);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Email verification successfull. Please login",
    data: result,
  });
});

const getMyData = catchAsync(async (req, res) => {
  const user = req.user;
  console.log(user);
  const result = await AuthServices.getMyDataFromDB(user.email);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully retrived data",
    data: result,
  });
});

export const AuthController = {
  adminLogin,
  refreshToken,
  getMyData,
  forgotPassword,
  resetPassword,
  SendVerificationEmail,
  verifyEmail,
};
