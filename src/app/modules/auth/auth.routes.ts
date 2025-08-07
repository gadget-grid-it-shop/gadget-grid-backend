import { Router } from "express";
import { AuthController } from "./auth.controller";
import validateAuth from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { authValidations } from "./auth.validation";

const router = Router();

router.post("/admin-login", AuthController.adminLogin);

router.post("/refresh-token", AuthController.refreshToken);

router.post(
  "/forgot-password",
  validateRequest(authValidations.forgotPassValidationSchema),
  AuthController.forgotPassword
);

router.post(
  "/reset-password",
  validateRequest(authValidations.resetPassValidationSchema),
  AuthController.resetPassword
);

router.post(
  "/send-verification",
  validateRequest(authValidations.forgotPassValidationSchema),
  AuthController.SendVerificationEmail
);

router.post(
  "/verify-email",
  validateRequest(authValidations.forgotPassValidationSchema),
  AuthController.verifyEmail
);

router.get("/getMyData", validateAuth(), AuthController.getMyData);

router.post(
  "/update-password",
  validateAuth(),
  validateRequest(authValidations.updatePassValidationSchema),
  AuthController.updatePassword
);

export const AuthRoutes = router;
