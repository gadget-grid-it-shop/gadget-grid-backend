export interface TUser {
    email: string,
    password: string,
    isActive?: boolean,
    role: 'customer' | string,
    isDeleted?: boolean,
    isVarified?: boolean
}