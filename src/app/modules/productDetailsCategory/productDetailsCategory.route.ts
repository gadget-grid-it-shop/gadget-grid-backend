import {Router} from "express";
import {ProductDetailsCategoryControllers} from "./productDetailsCategory.controller";

const router = Router();

router.post("/create", ProductDetailsCategoryControllers.createProductDetailsCategory);

router.patch("/update/:id", ProductDetailsCategoryControllers.updateProductDetailsCategory);

export const ProductDetailsCategoryRoutes = router;
