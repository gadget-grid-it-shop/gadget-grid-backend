import { Types } from "mongoose";

export type TAttributeOption = {
  id: string;
  isColor?: boolean;
  value: string;
  color?: string;
};

export interface TAttribute {
  _id: Types.ObjectId;
  title: string;
  options: TAttributeOption[];
  isDeleted?: boolean;
}
