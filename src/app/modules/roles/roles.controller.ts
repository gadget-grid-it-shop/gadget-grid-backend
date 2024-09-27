import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TRole } from "./roles.interface";
import { RolesService } from "./roles.service";

const createRole = catchAsync(async (req, res) => {
    const role: TRole = req.body

    const result = await RolesService.createRoleIntoDB(role)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Role created successfully',
        data: result
    })
})


export const RolesController = {
    createRole
}