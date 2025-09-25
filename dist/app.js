"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./app/routes"));
const globalErrorHandler_1 = require("./app/middleware/globalErrorHandler");
const notFound_1 = __importDefault(require("./app/middleware/notFound"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const order_service_1 = require("./app/modules/order/order.service");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://192.168.0.101:4000",
        "http://localhost:4000",
        "http://192.168.0.112:3000",
        "https://gadget-grid-admin-v2-fork.vercel.app",
        "https://gadget-grid-homepage-fork.vercel.app",
    ],
    credentials: true,
}));
app.use("/payment/webhook", express_1.default.raw({ type: "application/json" }), order_service_1.paymentWebhook);
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/api/v1", routes_1.default);
app.use(globalErrorHandler_1.globalErrorHandler);
app.use(notFound_1.default);
exports.default = app;
