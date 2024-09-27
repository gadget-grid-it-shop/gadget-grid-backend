import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TUser } from "./user.interface";
import { UserServices } from "./user.service";
import { UserValidations } from "./user.validation";

const createUser = catchAsync(async (req, res, next) => {
    const user: TUser = req.body

    const validate = await UserValidations.createUserValidationSchema.parseAsync(user)

    if (!validate) {
        console.log(validate)
        next()
    }

    const result = await UserServices.createUserIntoDB(user)

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