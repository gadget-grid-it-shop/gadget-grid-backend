"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.UserServices = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const user_model_1 = require("./user.model");
const admin_model_1 = require("../admin/admin.model");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const roles_model_1 = require("../roles/roles.model");
const createAdminIntoDB = (admin) => __awaiter(void 0, void 0, void 0, function* () {
    delete admin.isDeleted;
    const user = {
        email: admin.email,
        password: admin.password,
        role: admin.role
    };
    const roleExist = yield roles_model_1.Roles.findById(admin.role);
    if (!roleExist) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Role does not exist");
    }
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const adminExist = yield user_model_1.User.isUserExistsByEmail(admin.email);
        if (adminExist) {
            const deletedAdmin = yield admin_model_1.Admin.findOneAndDelete({ email: admin.email });
            if (!deletedAdmin) {
                throw new AppError_1.default(http_status_1.default.CONFLICT, "failed to create user");
            }
            const deleteUser = yield user_model_1.User.findOneAndDelete({ email: admin.email });
            if (!deleteUser) {
                throw new AppError_1.default(http_status_1.default.CONFLICT, "failed to create user");
            }
        }
        const userRes = yield user_model_1.User.create(user);
        if (!userRes) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, "failed to create user");
        }
        admin.user = userRes._id;
        const adminRes = yield admin_model_1.Admin.create(admin);
        if (!adminRes) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, "failed to create Admin");
        }
        yield session.commitTransaction();
        yield session.endSession();
        return adminRes;
    }
    catch (err) {
        yield session.abortTransaction();
        yield session.endSession();
        throw new AppError_1.default(http_status_1.default.CONFLICT, err instanceof AppError_1.default ? err === null || err === void 0 ? void 0 : err.message : "Failed to create user");
    }
});
const getAllAdminsFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_model_1.Admin.find({ isDeleted: false }).populate([
        {
            path: 'user',
            select: '-password'
        },
        {
            path: 'role',
            select: 'role isDeleted -_id'
        }
    ]);
    return result;
});
const getSingleUserFromDB = (id, query) => __awaiter(void 0, void 0, void 0, function* () {
    const userType = query === null || query === void 0 ? void 0 : query.userType;
    if (!userType) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'User type is required');
    }
    if (userType !== 'admin' && userType !== 'customer') {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Wrong user type');
    }
    const model = userType === 'admin' ? admin_model_1.Admin : userType === 'customer' ? admin_model_1.Admin : undefined;
    const userData = yield (model === null || model === void 0 ? void 0 : model.findById(id).populate([
        {
            path: 'user',
            select: '-password'
        },
        {
            path: 'role',
            select: 'role isDeleted -_id'
        }
    ]));
    if (!userData) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Failed to get user data');
    }
    if (userData.isDeleted) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'User was deleted');
    }
    return userData;
});
const deleteUserFromDB = (userId, role, authUserEmail) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'User not found');
    }
    const user = yield user_model_1.User.findById(userId);
    if ((user === null || user === void 0 ? void 0 : user.email) === authUserEmail) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "You can't delete your own account");
    }
    const session = yield (0, mongoose_1.startSession)();
    try {
        session.startTransaction();
        const deletedUser = yield user_model_1.User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });
        if (!deletedUser) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'Failed to delete user');
        }
        if (role === "admin") {
            const deletedAdmin = yield admin_model_1.Admin.findOneAndUpdate({ user: deletedUser._id }, { isDeleted: true }, { new: true });
            session.commitTransaction();
            session.endSession();
            return deletedAdmin;
        }
    }
    catch (err) {
        yield session.abortTransaction();
        yield session.endSession();
        if (err instanceof AppError_1.default) {
            throw new AppError_1.default(err.statusCode, err.message);
        }
        else {
            throw new AppError_1.default(http_status_1.default.CONFLICT, "Failed to delete user");
        }
    }
});
exports.UserServices = {
    createAdminIntoDB,
    getAllAdminsFromDB,
    deleteUserFromDB,
    getSingleUserFromDB
};
