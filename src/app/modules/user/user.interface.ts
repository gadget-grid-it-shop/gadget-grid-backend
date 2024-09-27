import { Model } from "mongoose";

export interface TUser {
    email: string,
    password: string,
    isActive?: boolean,
    role: 'customer' | string,
    isDeleted?: boolean,
    isVarified?: boolean,
    isMasterAdmin?: boolean
}


export interface TUserModel extends Model<TUser> {
    isUserExistsByEmail(email: string): Promise<TUser>,
    isUserVarified(email: string): boolean,
    findUserRoleByEmail(email: string): string
}