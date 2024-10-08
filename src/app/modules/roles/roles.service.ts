import { TRole } from "./roles.interface";
import { Roles } from "./roles.model";

const createRoleIntoDB = async (payload: TRole) => {
    const result = await Roles.create(payload)

    return result
}

const getAllRolesFromDB = async () => {
    const result = await Roles.find()

    return result
}

export const RolesService = {
    createRoleIntoDB,
    getAllRolesFromDB
}