import {Router} from "express";
import {ProductDetailsCategoryControllers} from "./productDetailsCategory.controller";

const router = Router();

router.post("/create", ProductDetailsCategoryControllers.createProductDetailsCategory);

export const ProductDetailsCategoryRoutes = router;
