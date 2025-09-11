import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DealsServices } from "./deals.service";

const createDeal = catchAsync(async (req, res) => {
  const user = req.user;

  const result = await DealsServices.createDealToDb(req.body, user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New deal added successfully",
    data: result,
  });
});

export const DealsController = {
  createDeal,
};
