import { TCategory } from "../category/category.interface";
import { TDiscount, TProduct, TProductCategory } from "./product.interface";

const typeMap: Record<string, "string" | "number" | "boolean"> = {
  price: "number",
  special_price: "number",
  "discount.value": "number",
  quantity: "number",
  "warranty.days": "number",
  "warranty.lifetime": "boolean",
  "shipping.free": "boolean",
  "shipping.cost": "number",
  isFeatured: "boolean",
};

export const claculateSpecialPrice = (
  discount: TDiscount,
  price: number
): number => {
  if (discount.type === "flat") {
    const newDiscount = price - discount.value;
    return Math.max(0, Math.round(newDiscount)); // Ensure no negative price
  } else {
    const newDiscount = price - Math.floor((price * discount.value) / 100);
    return Math.max(0, Math.round(newDiscount)); // Ensure no negative price
  }
};

export const transformSvgProductData = (
  data: Partial<TProduct>
): Partial<TProduct> => {
  const result: Partial<TProduct> = { ...data };

  Object.keys(typeMap).forEach((key) => {
    const keys = key.split("."); // Handle nested keys
    let current: any = result;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];

      if (i === keys.length - 1) {
        // Leaf node
        const expectedType = typeMap[key];
        const value = current[k];

        if (expectedType === "number") {
          current[k] = isNaN(Number(value)) ? 0 : Number(value);
        } else if (expectedType === "boolean") {
          current[k] = value === true || value === "true"; // Convert to boolean
        }
      } else {
        // Ensure nested objects exist
        if (!current[k]) {
          current[k] = {};
        }
        current = current[k];
      }
    }
  });

  return result;
};

export const createCategoryArray = (
  categoryArray: TCategory[],
  selected: TCategory | undefined,
  data: TProductCategory[] = []
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
      (cat: TCategory) => cat._id === selected.parent_id
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

export const extractCommonFilters = (
  products: Pick<TProduct, "filters">[]
): any[] => {
  if (!products.length) return [];

  // Create a map to count filter occurrences
  const filterMap = new Map<
    string,
    {
      filter: string;
      key: string;
      values: Set<string>;
      count: number;
    }
  >();

  // Process each product's filters
  products.forEach((product) => {
    if (product.filters && Array.isArray(product.filters)) {
      product.filters.forEach((filter) => {
        const filterKey = `${filter.filter}_${filter.key}`;

        if (filterMap.has(filterKey)) {
          const existing = filterMap.get(filterKey)!;
          existing.values.add(filter.value);
          existing.count += 1;
        } else {
          filterMap.set(filterKey, {
            filter: filter.filter,
            key: filter.key,
            values: new Set([filter.value]),
            count: 1,
          });
        }
      });
    }
  });

  // Convert to array and filter for common filters
  // You can adjust the threshold (e.g., appears in at least 20% of products)
  const threshold = Math.max(1, Math.floor(products.length * 0.1)); // At least 10% of products

  return Array.from(filterMap.values())
    .filter((filter) => filter.count >= threshold)
    .map((filter) => ({
      filter: filter.filter,
      key: filter.key,
      values: Array.from(filter.values).sort(),
      productCount: filter.count,
    }))
    .sort((a, b) => b.productCount - a.productCount); // Sort by popularity
};
