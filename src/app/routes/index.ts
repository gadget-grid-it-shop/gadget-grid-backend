import {Router} from "express";
import {ProductDetailsCategoryRoutes} from "../modules/productDetailsCategory/productDetailsCategory.route";
import {CategoryRoutes} from "../modules/category/category.route";

const router = Router();

const moduleRoutes = [
  {path: "/product-details-category", route: ProductDetailsCategoryRoutes},
  {path: "/category", route: CategoryRoutes},
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
