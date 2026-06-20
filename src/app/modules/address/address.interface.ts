import { Types } from "mongoose";

export interface IAddress {
  address: string;
  area: string;
  district: string;
  user?: Types.ObjectId;
}
