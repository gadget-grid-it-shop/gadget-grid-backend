import config from "../../config";
import { User } from "../user/user.model";
import { TLoginCredentials } from "./auth.interface";
import jwt from 'jsonwebtoken'

const adminLoginFromDB = async (payload: TLoginCredentials) => {
    const userExist = await User.isUserExistsByEmail(payload.email)

    if (!userExist) {
        throw new Error('User does not exist')
    }

    const matchPassword = await User.matchUserPassword(payload.password, userExist.password)

    if (!matchPassword) {
        throw new Error('Wrong password')
    }

    const jwtPayload = {
        role: userExist.role,
        email: userExist.email
    }

    const accessToken = jwt.sign(jwtPayload, config.access_secret as string, { expiresIn: '20d' })

    return {
        accessToken,
    }
}


export const AuthServices = {
    adminLoginFromDB
}