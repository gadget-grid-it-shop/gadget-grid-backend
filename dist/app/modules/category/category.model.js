"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const CategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        lowercase: true,
        unique: true
    },
    parent_id: {
        type: String,
        default: null,
        ref: "Category"
    },
    product_details_categories: {
        type: [String],
        validate: {
            validator: (value) => {
                return value.length > 0;
            },
            message: "At least one product detail category is required",
        },
        ref: "ProductDetailsCategory",
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});
exports.Category = (0, mongoose_1.model)("Category", CategorySchema);
