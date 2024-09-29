import jwt from 'jsonwebtoken'

type TCreateToken = {
    payload: { userRole: string, email: string },
    secret: string,
    expiresIn: string
}

export const createToken = ({ payload, secret, expiresIn }: TCreateToken) => {
    return jwt.sign(payload, secret, { expiresIn })
}