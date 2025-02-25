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
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        required: [true, "Role is required"],
        default: "customer",
        ref: "Roles",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isMasterAdmin: {
        type: Boolean,
    },
    passwordChangedAt: {
        type: String,
    },
});
UserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        user.password = yield bcrypt_1.default.hash(user.password, Number(config_1.default.bcrypt_hash_rounds));
        next();
    });
});
UserSchema.post("save", function (doc, next) {
    return __awaiter(this, void 0, void 0, function* () {
        doc.password = "";
        next();
    });
});
// ================== static methods ==================
UserSchema.statics.isUserExistsByEmail = function (email, lean) {
    return __awaiter(this, void 0, void 0, function* () {
        if (lean) {
            return yield exports.User.findOne({ email }).lean();
        }
        else {
            return yield exports.User.findOne({ email });
        }
    });
};
UserSchema.statics.isUserVarified = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        const exist = yield exports.User.isUserExistsByEmail(email);
        if (exist) {
            return exist.isVerified;
        }
        else {
            return false;
        }
    });
};
UserSchema.statics.findUserRoleByEmail = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        const exist = yield exports.User.isUserExistsByEmail(email);
        if (exist) {
            return exist.role;
        }
        else {
            return null;
        }
    });
};
UserSchema.statics.matchUserPassword = function (userPassword, databasePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(userPassword, databasePassword);
    });
};
exports.User = (0, mongoose_1.model)("User", UserSchema);
