import { Router } from "express";
import { getSettings, updateSettings } from "./settings.controller";
import { z } from "zod";
import checkPermission from "../../middleware/checkPermission";
import { EAppFeatures } from "../roles/roles.interface";
import { validateRequest } from "../../middleware/validateRequest";
import { SettingsValidationSchema } from "./settings.validation";

const router = Router();

// GET settings
router.get(
  "/settings",
  checkPermission(EAppFeatures.settings, "read"),
  getSettings
);

// UPDATE settings
router.put(
  "/settings",
  checkPermission(EAppFeatures.settings, "update"),
  validateRequest(SettingsValidationSchema.UpdateSettingsSchema),
  updateSettings
);

const SettingsRoute = router;

export default SettingsRoute;
