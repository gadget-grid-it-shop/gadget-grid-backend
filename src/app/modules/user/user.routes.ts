import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { UserValidations } from "./user.validation";
import { AdminValidations } from "../admin/admin.validation";

const router = Router()

router.post('/create-admin',
    validateRequest(UserValidations.createUserValidationSchema),
    validateRequest(AdminValidations.CreateAdminValidationSchema),
    UserController.createUser
)


export const UserRoutes = router