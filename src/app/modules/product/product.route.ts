import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { ProductValidations } from "./product.validations";
import { ProductControllers } from "./product.controller";
import checkPermission from "../../middleware/checkPermission";
import { EAppFeatures } from "../roles/roles.interface";

const router = Router()

router.post('/create-product', validateRequest(ProductValidations.createProductValidationSchema), checkPermission(EAppFeatures.product, 'create'), ProductControllers.createProduct)

router.get('/get-all', checkPermission(EAppFeatures.product, 'read'), ProductControllers.getAllProduct)


export const productRoutes = router