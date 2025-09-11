import { Router } from "express";
import checkPermission from "../../middleware/checkPermission";
import { EAppFeatures } from "../roles/roles.interface";
import { DealsController } from "./deal.controller";

const router = Router();

router.post(
  "/create",
  checkPermission(EAppFeatures.deals, "create"),
  DealsController.createDeal
);

const DealRoutes = router;

export default DealRoutes;
