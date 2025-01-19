import { JwtPayload } from "jsonwebtoken";
import { TAdmin } from "../modules/admin/admin.interface";
import { TUser } from "../modules/user/user.interface";

declare global {
    namespace Express {
        interface Request {
            user: JwtPayload
            admin: TAdmin,
            userData: TUser
        }
    }
}