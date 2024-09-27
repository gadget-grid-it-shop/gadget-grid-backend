import { Router } from "express";
import { ProductDetailsCategoryRoutes } from "../modules/productDetailsCategory/productDetailsCategory.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { productRoutes } from "../modules/product/product.route";
import { ImageRoutes } from "../modules/Images/image.route";
import { galleryRoutes } from "../modules/gallery/gallery.route";
import { UserRoutes } from "../modules/user/user.routes";

const router = Router();

const moduleRoutes = [
  { path: "/product-details-category", route: ProductDetailsCategoryRoutes },
  { path: "/category", route: CategoryRoutes },
  {
    path: '/product', route: productRoutes
  },
  { path: '/upload', route: ImageRoutes },
  { path: '/gallery', route: galleryRoutes },
  { path: '/user', route: UserRoutes }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
