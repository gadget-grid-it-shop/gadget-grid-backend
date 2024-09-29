import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { UserValidations } from "./user.validation";
import { AdminValidations } from "../admin/admin.validation";
import checkPermission from "../../middleware/checkPermission";
import { EAppFeatures } from "../roles/roles.interface";

const router = Router()

router.post('/create-admin',
    validateRequest(UserValidations.createUserValidationSchema),
    validateRequest(AdminValidations.CreateAdminValidationSchema),
    checkPermission(EAppFeatures.user, 'create'),
    UserController.createUser
)


export const UserRoutes = router