import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router()

router.post('/admin-login', AuthController.adminLogin)

router.post('/refresh-token', AuthController.refreshToken)


export const AuthRoutes = router