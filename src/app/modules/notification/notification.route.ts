import { Router } from "express";
import { NotificationContoller } from "./notification.controller";
import { validateRequest } from "../../middleware/validateRequest";

const router = Router();

router.get("/my-notifications", NotificationContoller.getMyNotifications);
router.post("/single/:id", NotificationContoller.markNotificationAsSeen);
router.post("/mark-all-seen", NotificationContoller.markAllNotificationSeen);

export const notificationRoutes = router;
