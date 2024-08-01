import {Router} from "express";
import {ProductDetailsCategoryRoutes} from "../modules/productDetailsCategory/productDetailsCategory.route";

const router = Router();

const moduleRoutes = [{path: "/product-details-category", route: ProductDetailsCategoryRoutes}];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
