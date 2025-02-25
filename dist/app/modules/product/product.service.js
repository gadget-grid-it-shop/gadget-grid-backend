"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const user_model_1 = require("../user/user.model");
const product_interface_1 = require("./product.interface");
const product_model_1 = require("./product.model");
const slugify_1 = __importDefault(require("slugify"));
const papaparse_1 = __importDefault(require("papaparse"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const category_model_1 = require("../category/category.model");
const product_utils_1 = require("./product.utils");
const brand_model_1 = require("../brand/brand.model");
const handleDuplicateError_1 = __importDefault(require("../../errors/handleDuplicateError"));
const mongodb_1 = require("mongodb");
const mongoose_1 = require("mongoose");
const bulkUpload_model_1 = __importDefault(require("../bulkUpload/bulkUpload.model"));
const queryBuilder_1 = __importDefault(require("../../builder/queryBuilder"));
const dayjs_1 = __importDefault(require("dayjs"));
const admin_model_1 = require("../admin/admin.model");
const notificaiton_utils_1 = require("../notification/notificaiton.utils");
const createProductIntoDB = (payload, email, thisAdmin) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user._id) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "Could not find admin information");
    }
    const slug = (0, slugify_1.default)(payload.name);
    const productData = payload;
    productData.createdBy = user._id;
    productData.slug = slug;
    productData.mainCategory = (_b = (_a = productData.category) === null || _a === void 0 ? void 0 : _a.find((c) => c.main === true)) === null || _b === void 0 ? void 0 : _b.id;
    if (payload.discount && ((_c = payload.discount) === null || _c === void 0 ? void 0 : _c.value) > 0) {
        productData.special_price = (0, product_utils_1.claculateSpecialPrice)(payload.discount, payload.price);
    }
    const result = yield product_model_1.Product.create(productData);
    if (result) {
        if (!thisAdmin || !thisAdmin.user) {
            return;
        }
        const notifications = yield (0, notificaiton_utils_1.buildNotifications)({
            source: result._id,
            text: "added a product",
            thisAdmin,
            notificationType: "product",
            actionType: "create",
        });
        yield (0, notificaiton_utils_1.addNotifications)({ notifications, userFrom: thisAdmin });
    }
    return result;
});
const getAllProductsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const searchFields = [
        "name",
        "model",
        "key_features",
        "description",
        "slug",
        "sku",
    ];
    const excludeFields = [
        "searchTerm",
        "page",
        "limit",
        "category",
        "sort",
        "fields",
    ];
    const pagination = {
        total: 0,
        currentPage: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
    };
    if (query.category) {
        query.mainCategory = new mongodb_1.ObjectId(query.category);
        delete query.categroy;
    }
    if (query.createdBy) {
        query.createdBy = new mongodb_1.ObjectId(query.createdBy);
    }
    if (query.createdAt) {
        const startOfDay = (0, dayjs_1.default)(query.createdAt)
            .startOf("day")
            .toDate();
        const endOfDay = (0, dayjs_1.default)(query.createdAt)
            .endOf("day")
            .toDate();
        query.createdAt = {
            $gte: startOfDay,
            $lt: endOfDay,
        };
    }
    const productQuery = new queryBuilder_1.default(product_model_1.Product.find(), query)
        .search(searchFields)
        .filter(excludeFields)
        .sort()
        .fields();
    yield productQuery.paginate();
    const result = yield productQuery.modelQuery.populate([
        {
            path: "brand",
            match: { _id: { $type: "objectId" } },
            select: "name image",
        },
        {
            path: "mainCategory",
            model: "Category",
        },
    ]);
    pagination.total = productQuery.total;
    return {
        products: result,
        pagination,
    };
});
const getSingleProductFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "Please provide product id to get details");
    }
    console.log(id);
    const result = yield product_model_1.Product.findById(id);
    return result;
});
const bulkUploadToDB = (file, mapedFields, email) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "No upload file provided");
    }
    const filePath = path_1.default.resolve(file.path);
    const categories = yield category_model_1.Category.find();
    const brands = yield brand_model_1.Brand.find();
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    const payload = yield new Promise((resolve, reject) => {
        const fileStream = fs_1.default.createReadStream(filePath);
        papaparse_1.default.parse(fileStream, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b;
                const { data: csvData, errors: csvErrors } = result;
                if (csvErrors.length > 0) {
                    reject(new AppError_1.default(http_status_1.default.CONFLICT, "Failed to read file"));
                    return;
                }
                const filteredData = [];
                for (const data of csvData) {
                    const newData = {
                        name: "",
                        price: 0,
                        special_price: 0,
                        discount: {
                            type: "percent",
                            value: 0,
                        },
                        sku: "",
                        brand: "",
                        model: "",
                        warranty: {
                            days: 0,
                            lifetime: false,
                        },
                        key_features: "",
                        quantity: 0,
                        category: [],
                        description: "",
                        videos: [],
                        gallery: [],
                        thumbnail: "",
                        slug: "",
                        attributes: [],
                        meta: {
                            title: "",
                            description: "",
                            image: "",
                        },
                        tags: [],
                        isFeatured: true,
                        shipping: {
                            free: true,
                            cost: 0,
                        },
                    };
                    for (const field of mapedFields) {
                        if (!field.key || !field.value)
                            return;
                        if (product_interface_1.defaultFields.includes(field.value)) {
                            const value = typeof data === "object" &&
                                data[field.key];
                            if (value !== undefined) {
                                if (field.value === "category") {
                                    const cat = categories.find((c) => c.name === data[field.key]);
                                    if (cat) {
                                        const productCat = (0, product_utils_1.createCategoryArray)(categories, cat);
                                        newData.category = productCat;
                                    }
                                }
                                else if (field.value === "shipping.cost") {
                                    newData.shipping = newData.shipping || {
                                        free: false,
                                        cost: 0,
                                    };
                                    newData.shipping.cost = Number(value);
                                }
                                else if (field.value === "shipping.free") {
                                    newData.shipping = {
                                        free: String(value).toLowerCase() == "true" ? true : false,
                                        cost: value == "true" ? 0 : ((_a = newData.shipping) === null || _a === void 0 ? void 0 : _a.cost) || 0,
                                    };
                                }
                                else if (field.value === "discount.type") {
                                    newData.discount = newData.discount || {
                                        type: "flat",
                                        value: 0,
                                    };
                                    newData.discount.type = value;
                                }
                                else if (field.value === "discount.value") {
                                    newData.discount = {
                                        type: ((_b = newData.discount) === null || _b === void 0 ? void 0 : _b.type) || "flat",
                                        value: value,
                                    };
                                }
                                else if (field.value === "meta.title") {
                                    newData.meta = newData.meta || {
                                        title: "",
                                        description: "",
                                        image: "",
                                    };
                                    newData.meta.title = value;
                                }
                                else if (field.value === "meta.description") {
                                    newData.meta = newData.meta || {
                                        title: "",
                                        description: "",
                                        image: "",
                                    };
                                    newData.meta.description = value;
                                }
                                else if (field.value === "meta.image") {
                                    newData.meta = newData.meta || {
                                        title: "",
                                        description: "",
                                        image: "",
                                    };
                                    newData.meta.image = value;
                                }
                                else if (field.value === "warranty.days") {
                                    (newData.warranty = newData.warranty || {
                                        days: 0,
                                        lifetime: false,
                                    }),
                                        (newData.warranty.days = value);
                                }
                                else if (field.value === "warranty.lifetime") {
                                    newData.warranty = newData.warranty || {
                                        days: 0,
                                        lifetime: false,
                                    };
                                    newData.warranty.lifetime =
                                        String(value).toLowerCase() == "true" || "TRUE"
                                            ? true
                                            : false;
                                }
                                else if (field.value in newData) {
                                    newData[field.value] = value;
                                }
                                if (field.value === "brand") {
                                    const exist = brands.find((b) => b.name === value);
                                    if (exist) {
                                        newData.brand = exist._id || "add brand";
                                    }
                                }
                                newData.slug = (0, slugify_1.default)(newData.name);
                                newData.sku = (0, slugify_1.default)(newData.name);
                                newData.createdBy = user._id;
                                newData.special_price = (0, product_utils_1.claculateSpecialPrice)(newData.discount, Number(newData.price));
                            }
                        }
                    }
                    filteredData.push((0, product_utils_1.transformSvgProductData)(newData));
                }
                resolve(filteredData);
            }),
            error: (err) => {
                reject(new AppError_1.default(http_status_1.default.CONFLICT, `Error parsing file: ${err.message}`));
            },
        });
    });
    if (payload.length === 0 || !payload) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "Failed to parse data. Pelase map all the fields properly");
    }
    const withError = [];
    const successData = [];
    for (const record of payload) {
        try {
            const res = yield product_model_1.Product.create(record);
            if (res) {
                successData.push({
                    name: record.name,
                    slug: record.slug,
                    sku: record.sku,
                    _id: res._id,
                });
            }
        }
        catch (err) {
            if (err.code === 11000) {
                const simplifiedError = (0, handleDuplicateError_1.default)(err);
                withError.push({
                    name: record.name,
                    errorSources: simplifiedError.errorSources,
                    data: record,
                });
            }
            else if (err instanceof mongoose_1.Error.CastError) {
                withError.push({
                    name: record.name,
                    errorSources: [
                        {
                            path: err === null || err === void 0 ? void 0 : err.path,
                            message: err.message || "Failed to create product",
                        },
                    ],
                    data: record,
                });
            }
            else if (err instanceof mongoose_1.Error.ValidationError) {
                const errorSources = [];
                Object.keys(err.errors).map((key) => {
                    errorSources.push({
                        path: key,
                        message: err.errors[key].message,
                    });
                });
                withError.push({
                    name: record.name,
                    errorSources,
                    data: record,
                });
            }
            else {
                withError.push({
                    name: record.name,
                    errorSources: [
                        {
                            path: "",
                            message: "Failed to create product",
                        },
                    ],
                    data: record,
                });
            }
        }
    }
    try {
        const bulkResult = yield bulkUpload_model_1.default.create({
            withError,
            successData,
            createdBy: user._id,
        });
    }
    catch (err) {
        // throw new AppError(httpStatus.CONFLICT, 'Failed to store bulk upload history')
    }
    const result = {
        withError,
        successData,
        createdBy: user._id,
    };
    return result;
});
const updateProductIntoDB = (id, payload, thisAdmin) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Please provide product id");
    }
    const exist = yield product_model_1.Product.findById(id);
    const admins = yield admin_model_1.Admin.findAllVerifiedAdmins();
    if (!exist) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "Product does not exist");
    }
    const result = yield product_model_1.Product.findByIdAndUpdate(id, payload, { new: true });
    if (result) {
        if (!thisAdmin || !thisAdmin.user) {
            return;
        }
        const notifications = yield (0, notificaiton_utils_1.buildNotifications)({
            source: result._id,
            text: "updated a product",
            thisAdmin,
            notificationType: "product",
            actionType: "update",
        });
        yield (0, notificaiton_utils_1.addNotifications)({ notifications, userFrom: thisAdmin });
    }
    return result;
});
exports.ProductServices = {
    createProductIntoDB,
    getAllProductsFromDB,
    bulkUploadToDB,
    getSingleProductFromDB,
    updateProductIntoDB,
};
