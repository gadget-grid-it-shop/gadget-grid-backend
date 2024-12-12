import { TCategory } from "../category/category.interface";
import { TDiscount, TProduct, TProductCategory } from "./product.interface";
const typeMap: Record<string, 'string' | 'number' | 'boolean'> = {
    price: 'number',
    'discount.value': 'number',
    quantity: 'number',
    'warranty.days': 'number',
    'shipping.free': 'boolean',
    'shipping.cost': 'number',
};

export const claculateSpecialPrice = (discount: TDiscount, price: number) => {
    if (discount.type === 'flat') {
        const newDiscount = price - discount.value
        return Math.round(newDiscount)
    }
    else {
        const newDiscount = price - Math.floor(price * discount.value / 100)
        return Math.round(newDiscount)
    }
}

export const transformSvgProductData = (flatData: Record<string, any>): TProduct => {
    const nestedData = {};

    Object.keys(flatData).forEach((key) => {
        const keys = key.split('.'); // Split keys by dot notation
        let current = nestedData;

        keys.forEach((k, index) => {
            if (index === keys.length - 1) {
                // Apply type conversion based on the typeMap
                const value = flatData[key];
                const expectedType = typeMap[key];

                if (expectedType === 'number') {
                    current[k] = Number(value); // Convert to number
                } else if (expectedType === 'boolean') {
                    current[k] = value === 'true'; // Convert to boolean
                } else {
                    current[k] = value; // Default to string
                }
            } else {
                // Ensure the key exists as an object
                if (!current[k]) {
                    current[k] = {};
                }
                current = current[k];
            }
        });
    });

    return nestedData;
};


export const createCategoryArray = (
    categoryArray: TCategory[],
    selected: TCategory | undefined,
    data: TProductCategory[] = [],
) => {
    if (!selected) {
        return;
    }

    if (selected.parent_id) {
        data.push({
            main: data.length === 0,
            id: selected._id as string,
        });
        const parent = categoryArray?.find(
            (cat: TCategory) => cat._id === selected.parent_id,
        );
        createCategoryArray(categoryArray, parent, data);
    } else {
        data.push({
            main: data.length === 0,
            id: selected._id as string,
        });
    }

    return data;
};
