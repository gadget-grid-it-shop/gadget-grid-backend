import { User } from "../user/user.model";
import { TLoginCredentials } from "./auth.interface";
import bcrypt from 'bcrypt'

const adminLoginFromDB = async (payload: TLoginCredentials) => {
    const userExist = await User.isUserExistsByEmail(payload.email)

    if (!userExist) {
        throw new Error('User does not exist')
    }

    const matchPassword = await User.matchUserPassword(payload.password, userExist.password)

    if (matchPassword) {
        return {
            token: 'fdjfjdfjdfsdjfsdkfjsdlkfjsdfjwer34'
        }
    }
}


export const AuthServices = {
    adminLoginFromDB
}