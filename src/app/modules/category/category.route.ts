import { Router } from "express";
import { CategoryControllers } from "./category.controller";

const router = Router();

router.post("/create", CategoryControllers.createCategory);

router.get("/get-all", CategoryControllers.getAllCategories);

router.delete('/:id', CategoryControllers.deleteCategory)

export const CategoryRoutes = router;
