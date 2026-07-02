import { Types } from "mongoose";

export type TAnalyticsEventType =
  | "pageView"
  | "addToCart"
  | "removeFromCart"
  | "purchase"
  | "initiateCheckout"
  | "addToWishlist"
  | "viewContent"
  | "search"
  | "custom";

export interface IAnalyticsEvent {
  _id: Types.ObjectId;
  eventType: TAnalyticsEventType;
  product?: Types.ObjectId;
  productSlug?: string;
  productName?: string;
  productPrice?: number;
  categoryId?: Types.ObjectId;
  categoryName?: string;
  sessionId: string;
  visitorId?: string;
  user?: Types.ObjectId;
  pageUrl: string;
  pageTitle?: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  language?: string;
  screenResolution?: string;
  timezone?: string;
  fbp?: string;
  fbc?: string;
  fbclid?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  metadata?: Record<string, unknown>;
}
