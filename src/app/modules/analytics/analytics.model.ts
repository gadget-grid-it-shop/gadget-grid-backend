import { model, Schema } from "mongoose";
import { IAnalyticsEvent } from "./analytics.interface";

const analyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    eventType: {
      type: String,
      enum: [
        "pageView",
        "addToCart",
        "removeFromCart",
        "purchase",
        "initiateCheckout",
        "addToWishlist",
        "viewContent",
        "search",
        "custom",
      ],
      required: true,
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    productSlug: { type: String },
    productName: { type: String },
    productPrice: { type: Number },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    categoryName: { type: String },
    sessionId: { type: String, required: true, index: true },
    visitorId: { type: String, index: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    pageUrl: { type: String, required: true },
    pageTitle: { type: String },
    referrer: { type: String },
    userAgent: { type: String },
    ip: { type: String },
    language: { type: String },
    screenResolution: { type: String },
    timezone: { type: String },
    fbp: { type: String },
    fbc: { type: String },
    fbclid: { type: String },
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    utmContent: { type: String },
    utmTerm: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  },
);

analyticsEventSchema.index({ createdAt: -1 });
analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ product: 1, eventType: 1 });

export const AnalyticsEvent = model<IAnalyticsEvent>(
  "AnalyticsEvent",
  analyticsEventSchema,
);
