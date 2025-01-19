import { TAdminName } from "../modules/admin/admin.interface";

export const makeFullName = (name: TAdminName): string => {
    const { firstName, middleName, lastName } = name;
    return [firstName, middleName, lastName].filter(Boolean).join(' ');
}