import { Model, Types } from "mongoose";
import { TAddress, TAdminName } from "../admin/admin.interface";

export interface TCustomer {
  name: TAdminName;
  email: string;
  address?: TAddress;
  phoneNumber: string;
  password: string;
  user: Types.ObjectId;
  profilePicture?: string;
  isDeleted?: boolean;
}
