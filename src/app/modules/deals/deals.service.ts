import { Types } from "mongoose";
import { IDeal } from "./deals.interface";
import Deal from "./deals.model";

const createDealToDb = async (data: Partial<IDeal>, user: Types.ObjectId) => {
  const payload: Partial<IDeal> = {
    title: data.title,
    description: data.description,
    endTime: data.endTime,
    startTime: data.startTime,
    image: data.image,
    createdBy: user,
    lastUpdatedBy: user,
    isActive: false,
  };

  const result = await Deal.create(payload);

  return result;
};

const addProductsToDeal = async (
  data: IDeal["products"],
  user: Types.ObjectId
) => {};

export const DealsServices = {
  createDealToDb,
};
