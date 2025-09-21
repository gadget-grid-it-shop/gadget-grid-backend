import { Model, Types } from "mongoose";
import { TAddress, TAdminName } from "../admin/admin.interface";

export interface TCustomer {
  name: TAdminName;
  email: string;
  address?: TAddress;
  user: Types.ObjectId;
  profilePicture?: string;
  isDeleted?: boolean;
}
