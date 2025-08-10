import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { OrderServices } from "./order.service";

const addOrder = catchAsync(async (req, res) => {
  const data = req.body;

  const user = req.user.userData?._id;
  const admin = req.user?.admin;

  const result = await OrderServices.addOrderToDB(data, user, admin);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order created successfully",
    data: result,
  });
});

export const OrderController = { addOrder };
