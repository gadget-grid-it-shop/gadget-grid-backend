import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TLoginCredentials } from "./auth.interface";
import { AuthServices } from "./auth.service";

const adminLogin = catchAsync(async (req, res) => {
    const payload: TLoginCredentials = req.body

    const result = await AuthServices.adminLoginFromDB(payload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Login successfull, welcome back',
        data: result
    })
})

export const AuthController = {
    adminLogin
}