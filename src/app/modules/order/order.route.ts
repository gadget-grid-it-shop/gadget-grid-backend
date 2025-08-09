import { Router } from "express";
import { OrderController } from "./order.controller";
import { validateRequest } from "../../middleware/validateRequest";
import orderValidations from "./order.validation";

const router = Router();

router.post(
  "/create",
  validateRequest(orderValidations.createOrderValidationSchema),
  OrderController.addOrder
);

export const OrderRoutes = router;
