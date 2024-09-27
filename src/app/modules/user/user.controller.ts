import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TUser } from "./user.interface";
import { UserServices } from "./user.service";
import { UserValidations } from "./user.validation";
import { TAdmin } from "../admin/admin.interface";

const createUser = catchAsync(async (req, res, next) => {
    const admin: TAdmin = req.body

    const result = await UserServices.createUserIntoDB(admin)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'User created successfully',
        data: result
    })
})


export const UserController = {
    createUser
}