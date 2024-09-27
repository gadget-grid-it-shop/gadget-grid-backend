import { Router } from "express";
import { RolesController } from "./roles.controller";

const router = Router()

router.post('/create-role', RolesController.createRole)

export const RolesRoutes = router