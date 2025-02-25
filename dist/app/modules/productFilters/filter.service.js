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
exports.FilterServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const filter_model_1 = __importDefault(require("./filter.model"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const createFilterIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield filter_model_1.default.create(payload);
    return result;
});
const getAllFiltersFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield filter_model_1.default.find();
    return result;
});
const deleteFilterFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const exist = yield filter_model_1.default.findFilterById(id);
    console.log(exist);
    if (!exist) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Product filter does not exists");
    }
    const result = yield filter_model_1.default.findByIdAndDelete(id);
    return result;
});
const updateFilterIntoDB = (payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    const exist = yield filter_model_1.default.findFilterById(id);
    if (!exist) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Product filter does not exists");
    }
    const result = yield filter_model_1.default.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
});
exports.FilterServices = {
    createFilterIntoDB,
    updateFilterIntoDB,
    getAllFiltersFromDB,
    deleteFilterFromDB,
};
