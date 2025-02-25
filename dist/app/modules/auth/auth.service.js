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
exports.AuthServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const user_model_1 = require("../user/user.model");
const auth_utils_1 = require("./auth.utils");
const admin_model_1 = require("../admin/admin.model");
const sendEmail_1 = require("../../utils/sendEmail");
const bcrypt_1 = __importDefault(require("bcrypt"));
const verifyToken_1 = __importDefault(require("../../utils/verifyToken"));
const adminLoginFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(payload);
    const userExist = yield user_model_1.User.isUserExistsByEmail(payload.email);
    if (!userExist) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "User does not exist");
    }
    if (userExist.isDeleted) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "Sorry, your account was deleted");
    }
    const matchPassword = yield user_model_1.User.matchUserPassword(payload.password, userExist.password);
    if (!matchPassword) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "Wrong password");
    }
    const jwtPayload = {
        // userRole: userExist.role,
        email: userExist.email,
    };
    const accessToken = (0, auth_utils_1.createToken)({ payload: jwtPayload, secret: config_1.default.access_secret, expiresIn: config_1.default.access_token_expires_in });
    const refreshToken = (0, auth_utils_1.createToken)({
        payload: jwtPayload,
        secret: config_1.default.refresh_secret,
        expiresIn: config_1.default.refresh_token_expires_in,
    });
    return {
        accessToken,
        refreshToken,
        isVerified: userExist.isVerified,
    };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized", "unauthorized access request");
    }
    const decoded = (0, verifyToken_1.default)(token, config_1.default.refresh_secret);
    if (!decoded) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized", "unauthorized access request");
    }
    const user = yield user_model_1.User.isUserExistsByEmail(decoded.email);
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Your account was deleted", "unauthorized access request");
    }
    if (!user.isActive) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Your account is blocked", "unauthorized access request");
    }
    const payload = {
        userRole: user.role,
        email: user.email,
    };
    const accessToken = (0, auth_utils_1.createToken)({ payload, secret: config_1.default.access_secret, expiresIn: config_1.default.access_token_expires_in });
    return {
        accessToken,
    };
});
const forgotPasswordService = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "User does not exist");
    }
    const jwtPayload = {
        email: user.email,
    };
    const resetToken = (0, auth_utils_1.createToken)({ payload: jwtPayload, secret: config_1.default.access_secret, expiresIn: "60m" });
    const admin = yield admin_model_1.Admin.findOne({ user: user._id });
    const resetUILink = `${config_1.default.client_url}/reset-password?email=${user.email}&token=${resetToken}`;
    const mailBody = (0, auth_utils_1.generateResetPassHtml)(resetUILink, admin === null || admin === void 0 ? void 0 : admin.name);
    yield (0, sendEmail_1.sendEmail)(user.email, mailBody, "Reset your password");
});
const resetPasswordService = (email, password, token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized", "unauthorized access request");
    }
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "User does not exist");
    }
    const decoded = (0, verifyToken_1.default)(token, config_1.default.access_secret);
    if (email !== decoded.email) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Wrong email");
    }
    const hashPassword = yield bcrypt_1.default.hash(password, Number(config_1.default.bcrypt_hash_rounds));
    const updatePasswordRes = yield user_model_1.User.findOneAndUpdate({ email }, { password: hashPassword }).select("-password");
    return updatePasswordRes;
});
const SendVerificationEmailService = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "User does not exist");
    }
    if (user.isVerified) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "User already verified. Please try signing in.");
    }
    const jwtPayload = {
        email: user.email,
    };
    const verificationToken = (0, auth_utils_1.createToken)({ payload: jwtPayload, secret: config_1.default.verify_secret, expiresIn: "10m" });
    const admin = yield admin_model_1.Admin.findOne({ user: user._id });
    const verifyUILink = `${config_1.default.client_url}/verify-email?email=${user.email}&token=${verificationToken}`;
    const mailBody = (0, auth_utils_1.generateVerifyEmailHtml)(verifyUILink, admin === null || admin === void 0 ? void 0 : admin.name);
    yield (0, sendEmail_1.sendEmail)(user.email, mailBody, "Verify your email");
});
const verifyEmailService = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized", "unauthorized access request");
    }
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "User does not exist");
    }
    if (user.isVerified) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are already verified. Please try signing in.");
    }
    const decoded = (0, verifyToken_1.default)(token, config_1.default.verify_secret);
    if (email !== decoded.email) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Wrong email");
    }
    const verifiedUser = yield user_model_1.User.findOneAndUpdate({ email }, { isVerified: true }).select("-password");
    return verifiedUser;
});
const updatePasswordService = (newPassword, currentPassword, email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "User does not exist");
    }
    const matchPassword = yield user_model_1.User.matchUserPassword(currentPassword, user.password);
    if (!matchPassword) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Password does not match');
    }
    const password = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_hash_rounds));
    const updated = yield user_model_1.User.updateOne({ email: user.email }, { password }).select('-password');
    return updated;
});
const getMyDataFromDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_model_1.Admin.findOne({ email }).populate([
        {
            path: "user",
            select: "-password",
        },
        {
            path: "role",
        },
    ]);
    // if (result?.isDeleted) {
    //   throw new AppError(httpStatus.UNAUTHORIZED, 'Your account was deleted')
    // }
    return result;
});
exports.AuthServices = {
    adminLoginFromDB,
    refreshToken,
    getMyDataFromDB,
    forgotPasswordService,
    resetPasswordService,
    SendVerificationEmailService,
    verifyEmailService,
    updatePasswordService
};
