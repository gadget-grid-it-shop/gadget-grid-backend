import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TLoginCredentials } from "./auth.interface";
import { AuthServices } from "./auth.service";
import config from "../../config";

const adminLogin = catchAsync(async (req, res) => {
  const payload: TLoginCredentials = req.body;

  const result = await AuthServices.adminLoginFromDB(payload);

  const { refreshToken, accessToken, isVerified } = result;

  res.cookie("gadget_grid_refresh_token", refreshToken, {
    secure: config.node_environment !== "development",
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: isVerified
      ? "Login successfull, welcome back"
      : "Please varify your email and try again",
    data: {
      accessToken: isVerified ? accessToken : null,
      isVerified,
    },
  });
});

const userLogin = catchAsync(async (req, res) => {
  const payload: TLoginCredentials = req.body;

  const result = await AuthServices.userLoginFromDB(payload);

  const { refreshToken, accessToken, isVerified } = result;

  res.cookie("gadget_grid_refresh_token", refreshToken, {
    secure: config.node_environment !== "development",
  });

  res.cookie("gadget_grid_access_token", accessToken, {
    secure: config.node_environment !== "development",
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: isVerified
      ? "Login successfull, welcome back"
      : "Please varify your email and try again",
    data: {
      accessToken: isVerified ? accessToken : null,
      refreshToken: isVerified ? refreshToken : null,
      isVerified,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { gadget_grid_refresh_token } = req.cookies;

  const result = await AuthServices.refreshToken(gadget_grid_refresh_token);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully created new access token",
    data: result,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const result = await AuthServices.forgotPasswordService(email);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reset Link is generated successfully",
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const token = req.headers.authorization;

  const result = await AuthServices.resetPasswordService(
    email,
    password,
    token
  );

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
    message:
      "A varificatin mail was sent to your email address. The link will expire in 10 minutes",
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

const updatePassword = catchAsync(async (req, res) => {
  const user = req.user;
  const { newPassword, currentPassword } = req.body;

  const result = await AuthServices.updatePasswordService(
    newPassword,
    currentPassword,
    user.email
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Email verification successfull. Please login",
    data: result,
  });
});

const getMyData = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await AuthServices.getMyDataFromDB(user.email, req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully retrived data",
    data: result,
  });
});

const registerCustomer = catchAsync(async (req, res) => {
  const result = await AuthServices.createCustomerIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Registration successfull. please validate your email.",
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
  updatePassword,
  userLogin,
  registerCustomer,
};
