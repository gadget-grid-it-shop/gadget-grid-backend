import { TRole } from "./roles.interface";
import { Roles } from "./roles.model";

const createRoleIntoDB = async (payload: TRole) => {
    const result = await Roles.create(payload)

    return result
}

export const RolesService = {
    createRoleIntoDB
}