import { Router } from "express";
import { customerController } from "./customerController";
import { BannerController } from "../banner/banner.controller";
import { ProductControllers } from "../product/product.controller";
import { AuthController } from "../auth/auth.controller";

const router = Router();

router.get("/category/get-all", customerController.getCategories);
router.get("/category/get-featured", customerController.getFeaturedCategories);
router.get("/banner/get-banner/:id", BannerController.getBanner);
router.get("/product/get-featured", ProductControllers.getFeaturedProducts);
router.get(
  "/product/by-category/:slug",
  ProductControllers.getProductsByCategory
);
router.get(
  "/product/get-single/:slug",
  ProductControllers.getSingleProductBySlug
);

router.get("/product/compare", ProductControllers.getCompareProducts);

router.get("/product/single/:id", ProductControllers.getSingleProduct);

// =============== auth ================
router.post("/login", AuthController.userLogin);

export const CustomerRoutes = router;
