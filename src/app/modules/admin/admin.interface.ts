import { Model, Types } from "mongoose";

export interface TAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface TName {
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface TAdmin {
  name: TName;
  email: string;
  address: TAddress;
  password: string;
  user: Types.ObjectId;
  role: string;
  profilePicture: string;
  isDeleted?: boolean;
}

export interface TAdminModel extends Model<TAdmin> {
  findAllVerifiedAdmins: () => Promise<TAdmin[]>;
}
