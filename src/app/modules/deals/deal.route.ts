import { Router } from "express";
import checkPermission from "../../middleware/checkPermission";
import { EAppFeatures } from "../roles/roles.interface";
import { DealsController } from "./deal.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { DealValidationSchema } from "./deals.validation";

const router = Router();

router.post(
  "/create",
  checkPermission(EAppFeatures.deals, "create"),
  validateRequest(DealValidationSchema.createDealSchema),
  DealsController.createDeal
);

router.put(
  "/add-products/:id",
  checkPermission(EAppFeatures.deals, "update"),
  DealsController.addProductsToDeal
);

const DealRoutes = router;

export default DealRoutes;
