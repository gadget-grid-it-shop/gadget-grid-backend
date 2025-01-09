import { TProductFilter } from "./filter.interface";
import ProductFilter from "./filter.model";

const createFilterIntoDB = async (payload: TProductFilter) => {
    const result = await ProductFilter.create(payload)

    return result
}

export const FilterServices = { createFilterIntoDB }