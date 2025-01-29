import httpStatus from "http-status";
import { TProductFilter } from "./filter.interface";
import ProductFilter from "./filter.model";
import AppError from "../../errors/AppError";

const createFilterIntoDB = async (payload: TProductFilter) => {
  const result = await ProductFilter.create(payload);

  return result;
};

const getAllFiltersFromDB = async () => {
  const result = await ProductFilter.find();
  return result;
};

const deleteFilterFromDB = async (id: string) => {
  const exist = await ProductFilter.findFilterById(id);

  console.log(exist);

  if (!exist) {
    throw new AppError(httpStatus.FORBIDDEN, "Product filter does not exists");
  }

  const result = await ProductFilter.findByIdAndDelete(id);

  return result;
};

const updateFilterIntoDB = async (
  payload: Partial<TProductFilter>,
  id: string
) => {
  const exist = await ProductFilter.findFilterById(id);

  if (!exist) {
    throw new AppError(httpStatus.FORBIDDEN, "Product filter does not exists");
  }

  const result = await ProductFilter.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return result;
};

export const FilterServices = {
  createFilterIntoDB,
  updateFilterIntoDB,
  getAllFiltersFromDB,
  deleteFilterFromDB,
};
