import { Router } from "express";
import { CategoryControllers } from "./category.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { CategoryValidations } from "./category.validation";
import checkPermission from "../../middleware/checkPermission";
import { EAppFeatures } from "../roles/roles.interface";

const router = Router();

router.post("/create", validateRequest(CategoryValidations.createCategoryValidationSchema), CategoryControllers.createCategory);

router.get("/get-all", checkPermission(EAppFeatures.category, 'read'), CategoryControllers.getAllCategories);

router.get('/single/:id', CategoryControllers.getSingleCategories)

router.delete('/:id', CategoryControllers.deleteCategory);

router.patch('/:id', validateRequest(CategoryValidations.updateCategoryValidationSchema), CategoryControllers.updateCategory)

export const CategoryRoutes = router;
