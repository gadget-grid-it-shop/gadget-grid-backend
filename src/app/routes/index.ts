import { Router } from "express";
import { ProductDetailsCategoryRoutes } from "../modules/productDetailsCategory/productDetailsCategory.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { productRoutes } from "../modules/product/product.route";
import { ImageRoutes } from "../modules/Images/image.route";
import { galleryRoutes } from "../modules/gallery/gallery.route";
import { UserRoutes } from "../modules/user/user.routes";
import { RolesRoutes } from "../modules/roles/roles.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import validateAuth from "../middleware/auth";
import { BrandRoutes } from "../modules/brand/brand.route";
import { bulkUploadRoutes } from "../modules/bulkUpload/bulkUpload.route";
import { FilterRoutes } from "../modules/productFilters/filter.routes";
import { notificationRoutes } from "../modules/notification/notification.route";
import { chatRoutes } from "../modules/chat/chat.route";
import { CustomerRoutes } from "../modules/customer/customerRoute";
import { OrderRoutes } from "../modules/order/order.route";

const router = Router();

const moduleRoutes = [
  { path: "/product-details-category", route: ProductDetailsCategoryRoutes },
  { path: "/category", route: CategoryRoutes },
  {
    path: "/product",
    route: productRoutes,
  },
  { path: "/upload", route: ImageRoutes },
  { path: "/gallery", route: galleryRoutes },
  { path: "/user", route: UserRoutes },
  { path: "/roles", route: RolesRoutes },
  { path: "/auth", route: AuthRoutes },
  { path: "/chat", route: chatRoutes },
  { path: "/brand", route: BrandRoutes },
  { path: "/upload-history", route: bulkUploadRoutes },
  { path: "/product-filters", route: FilterRoutes },
  { path: "/notification", route: notificationRoutes },
  { path: "/customer", route: CustomerRoutes },
  { path: "/order", route: OrderRoutes },
];

moduleRoutes.forEach((route) => {
  if (route.path === "/auth" || route.path === "/customer") {
    router.use(route.path, route.route);
  } else {
    router.use(route.path, validateAuth(), route.route);
  }
});

export default router;
