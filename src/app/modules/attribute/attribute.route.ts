import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { AttributeValidations } from "./attribute.validation";
import { AttributeControllers } from "./attribute.controller";
import checkPermission from "../../middleware/checkPermission";
import { EAppFeatures } from "../roles/roles.interface";

const router = Router();

router.post(
  "/create",
  checkPermission(EAppFeatures.attributes, "create"),
  validateRequest(AttributeValidations.createAttributeValidationSchema),
  AttributeControllers.createAttribute,
);

router.get("/get-all", AttributeControllers.getAllAttributes);

router.get("/single/:id", AttributeControllers.getSingleAttribute);

router.patch(
  "/update/:id",
  checkPermission(EAppFeatures.attributes, "update"),
  AttributeControllers.updateAttribute,
);

router.delete(
  "/delete/:id",
  checkPermission(EAppFeatures.attributes, "delete"),
  AttributeControllers.deleteAttribute,
);

export const AttributeRoutes = router;
