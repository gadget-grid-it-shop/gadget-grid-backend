import {Router} from "express";
import {AuthController} from "./auth.controller";
import validateAuth from "../../middleware/auth";
import {validateRequest} from "../../middleware/validateRequest";
import {authValidations} from "./auth.validation";

const router = Router();

router.post("/admin-login", AuthController.adminLogin);

router.post("/refresh-token", validateAuth(), AuthController.refreshToken);

router.post("/forgot-password", validateRequest(authValidations.forgotPassValidatioSchema), AuthController.forgotPassword);

router.post("/reset-password", validateRequest(authValidations.resetPassValidatioSchema), AuthController.resetPassword);

router.get("/getMyData", validateAuth(), AuthController.getMyData);

export const AuthRoutes = router;
