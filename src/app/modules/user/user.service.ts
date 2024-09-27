import { TUser } from "./user.interface";
import { User } from "./user.model";

const createUserIntoDB = async (user: TUser) => {
    const exist = await User.findOne({ email: user.email })

    if (exist) {
        throw new Error('User already exists. Try signing in')
    }

    const result = await User.create(user)

    return result
}


export const UserServices = {
    createUserIntoDB
}