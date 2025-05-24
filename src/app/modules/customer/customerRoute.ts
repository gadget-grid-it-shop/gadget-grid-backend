import { Router } from "express";
import { customerController } from "./customerController";
import { BannerController } from "../banner/banner.controller";
import { ProductControllers } from "../product/product.controller";

const router = Router();

router.get("/category/get-all", customerController.getCategories);
router.get("/banner/get-banner/:id", BannerController.getBanner);
router.get("/product/get-featured", ProductControllers.getFeaturedProducts);

export const CustomerRoutes = router;
