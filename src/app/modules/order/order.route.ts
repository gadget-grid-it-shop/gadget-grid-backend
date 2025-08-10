import { Router } from "express";
import { OrderController } from "./order.controller";
import { validateRequest } from "../../middleware/validateRequest";
import orderValidations from "./order.validation";
import { validateCustomer } from "../../middleware/auth";

const router = Router();

router.post(
  "/create",
  validateRequest(orderValidations.createOrderValidationSchema),
  validateCustomer(),
  OrderController.addOrder
);

router.get("/my-orders", validateCustomer(), OrderController.getMyOrders);
router.get("/single/:orderNumber", OrderController.getOrderByOrderNumber);

export const OrderRoutes = router;
