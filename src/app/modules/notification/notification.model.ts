import { model, Schema } from "mongoose";
import { TNotification } from "./notification.interface";

const notificationSchema = new Schema<TNotification>(
  {
    opened: {
      type: Boolean,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    userFrom: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    userTo: {
      type: Schema.Types.ObjectId,
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
        "order",
        "address",
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
  },
  { timestamps: true }
);

const Notification = model<TNotification>("notifications", notificationSchema);

export default Notification;
