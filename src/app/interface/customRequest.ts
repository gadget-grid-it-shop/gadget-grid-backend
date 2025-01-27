import { JwtPayload } from "jsonwebtoken";
import { TAdmin } from "../modules/admin/admin.interface";
import { TUser } from "../modules/user/user.interface";

export type TAdminAndUser = TAdmin & { user: TUser };

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
      admin: TAdminAndUser;
      userData: TUser;
    }
  }
}

declare module "socket.io" {
  interface Socket {
    user?: JwtPayload;
    admin?: TAdmin;
    userData?: TUser;
  }
}
