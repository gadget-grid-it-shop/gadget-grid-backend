import { AddOrderPayload } from "./order.interface";

const addOrderToDB = async (data: AddOrderPayload, user: string) => {
  console.log(data);
};

export const OrderServices = { addOrderToDB };
