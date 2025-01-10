import { Router } from "express";
import checkPermission from "../../middleware/checkPermission";
import { EAppFeatures } from "../roles/roles.interface";
import { FilterControllers } from "./filter.controller";

const router = Router()

router.post('/create', checkPermission(EAppFeatures.productFilter, 'create'), FilterControllers.createFilter)
router.patch('/update/:id', checkPermission(EAppFeatures.productFilter, 'update'), FilterControllers.updateFilter)
router.get('/get-all', checkPermission(EAppFeatures.productFilter, 'read'), FilterControllers.getAllFilters)

export const FilterRoutes = router