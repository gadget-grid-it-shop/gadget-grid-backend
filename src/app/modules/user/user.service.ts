import { TUser } from "./user.interface";
import { User } from "./user.model";

const createUserIntoDB = async (user: TUser) => {

    delete user.isMasterAdmin

    if (await User.isUserExistsByEmail(user.email)) {
        throw new Error('User already exists. Try signing in')
    }

    const result = await User.create(user)

    return result
}


export const UserServices = {
    createUserIntoDB
}