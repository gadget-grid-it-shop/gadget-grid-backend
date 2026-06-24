import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AttributeServices } from "./attribute.service";

const createAttribute = catchAsync(async (req, res) => {
  const result = await AttributeServices.createAttributeIntoDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Attribute created successfully",
    data: result,
  });
});

const getAllAttributes = catchAsync(async (req, res) => {
  const result = await AttributeServices.getAllAttributesFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Attributes retrieved successfully",
    data: result,
  });
});

const getSingleAttribute = catchAsync(async (req, res) => {
  const result = await AttributeServices.getSingleAttributeFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Attribute retrieved successfully",
    data: result,
  });
});

const updateAttribute = catchAsync(async (req, res) => {
  const result = await AttributeServices.updateAttributeIntoDB(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Attribute updated successfully",
    data: result,
  });
});

const deleteAttribute = catchAsync(async (req, res) => {
  const result = await AttributeServices.deleteAttributeFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Attribute deleted successfully",
    data: result,
  });
});

export const AttributeControllers = {
  createAttribute,
  getAllAttributes,
  getSingleAttribute,
  updateAttribute,
  deleteAttribute,
};
