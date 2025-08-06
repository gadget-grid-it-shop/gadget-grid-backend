import catchAsync from "../../utils/catchAsync";
import { OrderServices } from "./order.service";

const addOrder = catchAsync(async (req, res) => {
  const data = req.body;

  const user = req.user.userData?._id;

  const result = await OrderServices.addOrderToDB(data, user);
});

export const OrderController = { addOrder };
