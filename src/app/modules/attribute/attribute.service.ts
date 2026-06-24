import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TAttribute } from "./attribute.interface";
import { Attribute } from "./attribute.model";

const createAttributeIntoDB = async (payload: TAttribute) => {
  const result = await Attribute.create(payload);
  return result;
};

const getAllAttributesFromDB = async () => {
  const result = await Attribute.find({ isDeleted: false });
  return result;
};

const getSingleAttributeFromDB = async (id: string) => {
  const result = await Attribute.findById(id);
  if (!result || result.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Attribute not found");
  }
  return result;
};

const updateAttributeIntoDB = async (id: string, payload: Partial<TAttribute>) => {
  const result = await Attribute.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Attribute not found");
  }
  return result;
};

const deleteAttributeFromDB = async (id: string) => {
  const result = await Attribute.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Attribute not found");
  }
  return result;
};

export const AttributeServices = {
  createAttributeIntoDB,
  getAllAttributesFromDB,
  getSingleAttributeFromDB,
  updateAttributeIntoDB,
  deleteAttributeFromDB,
};
