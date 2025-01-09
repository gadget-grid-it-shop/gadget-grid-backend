import { Router } from "express";
import checkPermission from "../../middleware/checkPermission";
import { EAppFeatures } from "../roles/roles.interface";
import { FilterControllers } from "./filter.controller";

const router = Router()

router.post('/create', checkPermission(EAppFeatures.productFilter, 'create'), FilterControllers.createFilter)

export const FilterRoutes = router