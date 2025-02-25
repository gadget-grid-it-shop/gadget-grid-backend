"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    opened: {
        type: Boolean,
        required: true,
    },
    source: {
        type: String,
        required: true,
    },
    userFrom: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    userTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    text: {
        type: String,
        required: true,
    },
    notificationType: {
        type: String,
        enum: [
            "gallery",
            "role",
            "product",
            "productDetails",
            "category",
            "photo",
            "user",
            "brand",
            "bulkUpload",
            "productFilter",
        ],
    },
    actionType: {
        type: String,
        enum: ["create", "update", "delete"],
    },
}, { timestamps: true });
const Notification = (0, mongoose_1.model)("notifications", notificationSchema);
exports.default = Notification;
