import {Router} from "express";
import {ProductDetailsCategoryControllers} from "./productDetailsCategory.controller";
import { ProductDetailsCategoryValidations } from "./productDetailsCategory.validation";
import { validateRequest } from "../../middleware/validateRequest";

const router = Router();

router.post(
    "/create",
    validateRequest(ProductDetailsCategoryValidations.createProductDetailsCategoryValidationSchema),
    ProductDetailsCategoryControllers.createProductDetailsCategory
);

router.patch(
    "/update/:id",
    validateRequest(ProductDetailsCategoryValidations.updateProductDetailsCategoryValidationSchema),
    ProductDetailsCategoryControllers.updateProductDetailsCategory
);

router.get("/single/:id", ProductDetailsCategoryControllers.getSingleProductDetailsCategory);

router.get("/get-all", ProductDetailsCategoryControllers.getAllProductDetailsCategory);

router.delete("/delete/:id", ProductDetailsCategoryControllers.deleteProductDetailsCategory);

export const ProductDetailsCategoryRoutes = router;
