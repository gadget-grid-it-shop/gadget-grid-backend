import { Router } from "express";
import { AnalyticsController } from "./analytics.controller";

const router = Router();

router.get("/events", AnalyticsController.getAllEvents);
router.get("/stats", AnalyticsController.getEventStats);
router.get("/product-stats/:productId", AnalyticsController.getProductStats);
router.get("/top-products", AnalyticsController.getTopProducts);

export const AnalyticsRoutes = router;
