import { Router } from "express";
import { customerController } from "./customerController";

const router = Router()

router.get('/category/get-all', customerController.getCategories)

export const CustomerRoutes = router