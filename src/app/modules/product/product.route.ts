import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { ProductValidations } from "./product.validations";
import { ProductControllers } from "./product.controller";

const router = Router()

router.post('/create-product', validateRequest(ProductValidations.createProductValidationSchema), ProductControllers.createProduct)

router.get('/get-all', ProductControllers.getAllProduct)


export const productRoutes = router