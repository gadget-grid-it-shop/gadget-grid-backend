import httpStatus from "http-status"
import catchAsync from "../utils/catchAsync"
import AppError from "../errors/AppError"

const validateAuth = () => {
    return catchAsync(async (req, res, next) => {
        const token = req.headers.authorization
        if (!token) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized', 'unauthorized access request')
        }
        next()
    })
}


export default validateAuth