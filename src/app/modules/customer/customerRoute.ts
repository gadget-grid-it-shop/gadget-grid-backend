import { Router } from "express";
import { customerController } from "./customerController";
import { BannerController } from "../banner/banner.controller";
import { ProductControllers } from "../product/product.controller";

const router = Router();

router.get("/category/get-all", customerController.getCategories);
router.get("/category/get-featured", customerController.getFeaturedCategories);
router.get("/banner/get-banner/:id", BannerController.getBanner);
router.get("/product/get-featured", ProductControllers.getFeaturedProducts);
router.get(
  "/product/by-category/:slug",
  ProductControllers.getProductsByCategory
);

export const CustomerRoutes = router;
