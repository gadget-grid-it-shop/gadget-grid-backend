import { JwtPayload } from "jsonwebtoken";
import { TUser } from "../modules/user/user.interface";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
      userRole: string;
      id: string;
      userData: TUser;
    }
  }
}

declare module "socket.io" {
  interface Socket {
    user?: JwtPayload;
    userData?: TUser;
    userRole: string;
  }
}
