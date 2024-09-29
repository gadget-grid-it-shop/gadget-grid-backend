import httpStatus from "http-status"
import catchAsync from "../utils/catchAsync"
import AppError from "../errors/AppError"
import jwt, { JwtPayload } from "jsonwebtoken"
import config from "../config"

const validateAuth = () => {
    return catchAsync(async (req, res, next) => {
        const token = req.headers.authorization
        if (!token) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized', 'unauthorized access request')
        }

        // check if varified user
        const decoded = jwt.verify(token, config.access_secret as string) as JwtPayload

        if (!decoded) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized', 'unauthorized access request')
        }

        req.user = {
            userRole: decoded.userRole,
            email: decoded.email
        }

        next()
    })
}


export default validateAuth