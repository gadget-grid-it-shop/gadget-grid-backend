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
  },
  { timestamps: true }
);

const Notification = model<TNotification>("notifications", notificationSchema);

export default Notification;
