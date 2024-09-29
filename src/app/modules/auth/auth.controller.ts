import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TLoginCredentials } from "./auth.interface";
import { AuthServices } from "./auth.service";
import config from "../../config";

const adminLogin = catchAsync(async (req, res) => {
    const payload: TLoginCredentials = req.body

    const result = await AuthServices.adminLoginFromDB(payload)

    const { refreshToken, accessToken } = result

    res.cookie('refreshToken', refreshToken, {
        secure: config.node_environment !== 'development'
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Login successfull, welcome back',
        data: {
            accessToken
        }
    })
})


const refreshToken = catchAsync(async (req, res) => {

    const { refreshToken } = req.cookies

    const result = await AuthServices.refreshToken(refreshToken)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Successfully created new access token',
        data: result
    })
})


export const AuthController = {
    adminLogin,
    refreshToken
}