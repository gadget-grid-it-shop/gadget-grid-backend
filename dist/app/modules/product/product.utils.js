"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategoryArray = exports.transformSvgProductData = exports.claculateSpecialPrice = void 0;
const typeMap = {
    price: 'number',
    special_price: 'number',
    'discount.value': 'number',
    quantity: 'number',
    'warranty.days': 'number',
    'warranty.lifetime': 'boolean',
    'shipping.free': 'boolean',
    'shipping.cost': 'number',
    isFeatured: 'boolean',
};
const claculateSpecialPrice = (discount, price) => {
    if (discount.type === 'flat') {
        const newDiscount = price - discount.value;
        return Math.max(0, Math.round(newDiscount)); // Ensure no negative price
    }
    else {
        const newDiscount = price - Math.floor((price * discount.value) / 100);
        return Math.max(0, Math.round(newDiscount)); // Ensure no negative price
    }
};
exports.claculateSpecialPrice = claculateSpecialPrice;
const transformSvgProductData = (data) => {
    const result = Object.assign({}, data);
    Object.keys(typeMap).forEach((key) => {
        const keys = key.split('.'); // Handle nested keys
        let current = result;
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (i === keys.length - 1) {
                // Leaf node
                const expectedType = typeMap[key];
                const value = current[k];
                if (expectedType === 'number') {
                    current[k] = isNaN(Number(value)) ? 0 : Number(value);
                }
                else if (expectedType === 'boolean') {
                    current[k] = value === true || value === 'true'; // Convert to boolean
                }
            }
            else {
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
exports.transformSvgProductData = transformSvgProductData;
const createCategoryArray = (categoryArray, selected, data = []) => {
    if (!selected) {
        return;
    }
    if (selected.parent_id) {
        data.push({
            main: data.length === 0,
            id: selected._id,
        });
        const parent = categoryArray === null || categoryArray === void 0 ? void 0 : categoryArray.find((cat) => cat._id === selected.parent_id);
        (0, exports.createCategoryArray)(categoryArray, parent, data);
    }
    else {
        data.push({
            main: data.length === 0,
            id: selected._id,
        });
    }
    return data;
};
exports.createCategoryArray = createCategoryArray;
