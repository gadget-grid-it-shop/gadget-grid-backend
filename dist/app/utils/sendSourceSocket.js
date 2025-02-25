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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSourceSocket = void 0;
const socket_1 = require("../../socket");
const admin_model_1 = require("../modules/admin/admin.model");
const sendSourceSocket = (_a) => __awaiter(void 0, [_a], void 0, function* ({ payload, ignore, event, }) {
    var _b;
    console.log(payload);
    const exceptRooms = ignore !== null && ignore !== void 0 ? ignore : "";
    const admins = yield admin_model_1.Admin.findAllVerifiedAdmins();
    const io = (0, socket_1.getIO)();
    for (const admin of admins) {
        io.to(`${String((_b = admin.user) === null || _b === void 0 ? void 0 : _b._id)}`)
            .except([...exceptRooms])
            .emit(event, payload);
    }
});
exports.sendSourceSocket = sendSourceSocket;
