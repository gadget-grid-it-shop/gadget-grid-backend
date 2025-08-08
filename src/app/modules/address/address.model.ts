import mongoose, { model, Schema } from "mongoose";
import { IAddress } from "../order/order.interface";

const addressSchema = new Schema<IAddress>({
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

const Address = model<IAddress>("Address", addressSchema);

export default Address;
