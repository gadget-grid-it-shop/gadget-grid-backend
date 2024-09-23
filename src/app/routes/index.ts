import { Router } from "express";
import { ProductDetailsCategoryRoutes } from "../modules/productDetailsCategory/productDetailsCategory.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { productRoutes } from "../modules/product/product.route";
import { ImageRoutes } from "../modules/Images/image.route";

const router = Router();

const moduleRoutes = [
  { path: "/product-details-category", route: ProductDetailsCategoryRoutes },
  { path: "/category", route: CategoryRoutes },
  {
    path: '/product', route: productRoutes
  },
  { path: '/upload', route: ImageRoutes }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
