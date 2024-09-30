import { Router } from "express";
import { AuthController } from "./auth.controller";
import validateAuth from "../../middleware/auth";

const router = Router()

router.post('/admin-login', AuthController.adminLogin)

router.post('/refresh-token', AuthController.refreshToken)

router.get('/getMyData', validateAuth(), AuthController.getMyData)


export const AuthRoutes = router