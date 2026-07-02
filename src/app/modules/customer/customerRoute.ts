import { Router } from "express";
import { customerController } from "./customerController";
import { BannerController } from "../banner/banner.controller";
import { ProductControllers } from "../product/product.controller";
import { AuthController } from "../auth/auth.controller";
import { SettingsController } from "../settings/settings.controller";
import { validateRequest } from "../../middleware/validateRequest";
import orderValidations from "../order/order.validation";
import { OrderController } from "../order/order.controller";
import { AnalyticsController } from "../analytics/analytics.controller";

const router = Router();

router.get("/category/get-all", customerController.getCategories);
router.get("/category/single/:slug", customerController.getCategoryDataBySlug);
router.get("/category/static-slugs", customerController.getStaticCategorySlugs);
router.get("/category/get-featured", customerController.getFeaturedCategories);
router.get("/banner/get-banner/:id", BannerController.getBanner);
router.get("/product/get-featured", ProductControllers.getFeaturedProducts);
router.get(
  "/product/by-category/:slug",
  ProductControllers.getProductsByCategory,
);
router.get(
  "/filters/by-category/:slug",
  ProductControllers.getFiltersByCategory,
);
router.get(
  "/product/get-single/:slug",
  ProductControllers.getSingleProductBySlug,
);

router.get("/data-for-sitemap", customerController.getDataForSitemap);

router.get("/product/search", ProductControllers.getSearchProducts);
router.get("/product/static-slugs", ProductControllers.getStaticProductSlugs);
router.get("/product/compare", ProductControllers.getCompareProducts);
router.get("/product/pc-builder/:id", ProductControllers.getPcBuilderProducts);

// ================ order ================
router.post(
  "/order/create",
  validateRequest(orderValidations.createOrderValidationSchema),
  OrderController.addOrder,
);

router.post(
  "/order/get-cart-price-data",
  validateRequest(orderValidations.getCartPriceDataValidationSchema),
  OrderController.getCartPriceDataFrom,
);

// =============== auth ================
router.post("/login", AuthController.userLogin);

// ==== pc builder ====
router.get("/settings/pc-builder", SettingsController.getPcBuilder);

// =============== analytics (no auth required) ================
router.post("/analytics/track", AnalyticsController.trackEvent);

export const CustomerRoutes = router;
