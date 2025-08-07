import { Types } from "mongoose";

// Interface for Order Item
export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
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
}

// Interface for Payment Details
export interface IPaymentDetails {
  transactionId?: string;
  paymentDate?: Date;
}

// Main Order Interface
export interface IOrder {
  userId: Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IAddress;
  billingAddress: IAddress;
  totalAmount: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: "card" | "paypal" | "bank_transfer" | "cod";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentDetails: IPaymentDetails;
  statusHistory: IStatusHistory[];
  currentStatus:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  shippingMethod: "standard" | "express" | "overnight";
  notes?: string;
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
