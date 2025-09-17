import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { OrderServices } from "./order.service";

const addOrder = catchAsync(async (req, res) => {
  const data = req.body;

  const user = req.user.userData;

  const result = await OrderServices.addOrderToDB(data, user._id, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order created successfully",
    data: result,
  });
});

const getMyOrders = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await OrderServices.getMyOrdersFromDB(
    req.query,
    userId.toString()
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Orders retrived successfully",
    data: result,
  });
});

const getOrderByOrderNumber = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const orderNumber = req.params.orderNumber;
  const result = await OrderServices.getOrderByOrderNumberFormDB(
    userId.toString(),
    orderNumber
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order retrived successfully",
    data: result,
  });
});

export const OrderController = { addOrder, getMyOrders, getOrderByOrderNumber };
