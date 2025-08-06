import { Router } from "express";
import { OrderController } from "./order.controller";

const router = Router();

router.post("/create", OrderController.addOrder);

export const OrderRoutes = router;
