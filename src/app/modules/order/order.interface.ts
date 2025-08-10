import { Types } from "mongoose";

// Interface for Order Item
export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  image?: string;
  tax: number;
  shipping: number;
}

// Interface for Status History
export interface IStatusHistory {
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  timestamp: Date;
  notes?: string;
}

// Interface for Address
export interface IAddress {
  address: string;
  city: string;
  district: string;
  user?: Types.ObjectId;
}

// Interface for Payment Details
export interface IPaymentDetails {
  transactionId?: string;
  paymentDate?: Date;
}

// Main Order Interface
export interface IOrder {
  user: Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IAddress;
  billingAddress: IAddress;
  totalAmount: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: "card" | "paypal" | "bank_transfer" | "cod";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentDetails: IPaymentDetails;
  statusHistory: IStatusHistory[];
  currentStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  shippingMethod: "standard" | "express" | "overnight";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AddOrderPayload = {
  products: {
    id: Types.ObjectId;
    quantity: number;
  }[];
  billingAddress: IAddress;
  shippingAddress: IAddress;
  paymentMethod: "card" | "paypal" | "bank_transfer" | "cod";
  shippingMethod: "standard" | "express" | "overnight";
  notes?: string;
  saveAddress?: boolean;
};
