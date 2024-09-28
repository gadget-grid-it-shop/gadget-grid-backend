import { Router } from "express";
import { RolesController } from "./roles.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { RolesValidations } from "./roles.validation";

const router = Router()

router.post('/create-role', validateRequest(RolesValidations.createRoleValidationSchema), RolesController.createRole)

export const RolesRoutes = router