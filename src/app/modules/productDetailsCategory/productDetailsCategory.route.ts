import {Router} from "express";
import {ProductDetailsCategoryControllers} from "./productDetailsCategory.controller";

const router = Router();

router.post("/create", ProductDetailsCategoryControllers.createProductDetailsCategory);

router.patch("/update/:id", ProductDetailsCategoryControllers.updateProductDetailsCategory);

router.get("/single/:id", ProductDetailsCategoryControllers.getSingleProductDetailsCategory);

router.get("/get-all", ProductDetailsCategoryControllers.getAllProductDetailsCategory);

export const ProductDetailsCategoryRoutes = router;
