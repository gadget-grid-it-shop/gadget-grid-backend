import {Router} from "express";
import {CategoryControllers} from "./category.controller";

const router = Router();

router.post("/create", CategoryControllers.createCategory);

router.get("/get-all", CategoryControllers.getAllCategories);

export const CategoryRoutes = router;
