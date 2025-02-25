"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const auth_service_1 = require("./auth.service");
const config_1 = __importDefault(require("../../config"));
const adminLogin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const result = yield auth_service_1.AuthServices.adminLoginFromDB(payload);
    const { refreshToken, accessToken, isVerified } = result;
    res.cookie("refreshToken", refreshToken, {
        secure: config_1.default.node_environment !== "development",
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: isVerified ? "Login successfull, welcome back" : "Please varify your email and try again",
        data: {
            accessToken: isVerified ? accessToken : null,
            isVerified,
        },
    });
}));
const refreshToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies;
    const result = yield auth_service_1.AuthServices.refreshToken(refreshToken);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully created new access token",
        data: result,
    });
}));
const forgotPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const result = yield auth_service_1.AuthServices.forgotPasswordService(email);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Reset Link is generated successfully",
        data: result,
    });
}));
const resetPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const token = req.headers.authorization;
    const result = yield auth_service_1.AuthServices.resetPasswordService(email, password, token);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Your password was updated successfully",
        data: result,
    });
}));
const SendVerificationEmail = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const result = yield auth_service_1.AuthServices.SendVerificationEmailService(email);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "A varificatin mail was sent to your email address. The link will expire in 10 minutes",
        data: result,
    });
}));
const verifyEmail = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const token = req.headers.authorization;
    const result = yield auth_service_1.AuthServices.verifyEmailService(email, token);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Email verification successfull. Please login",
        data: result,
    });
}));
const updatePassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { newPassword, currentPassword } = req.body;
    const result = yield auth_service_1.AuthServices.updatePasswordService(newPassword, currentPassword, user.email);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Email verification successfull. Please login",
        data: result,
    });
}));
const getMyData = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield auth_service_1.AuthServices.getMyDataFromDB(user.email);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Successfully retrived data",
        data: result,
    });
}));
exports.AuthController = {
    adminLogin,
    refreshToken,
    getMyData,
    forgotPassword,
    resetPassword,
    SendVerificationEmail,
    verifyEmail,
    updatePassword
};
