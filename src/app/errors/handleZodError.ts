import { ZodError, ZodIssue } from "zod"
import { TErrorSourse } from "../interface/error.interface"
import config from "../config"

export const handleZodError = (err: ZodError) => {

    const errorSourses: TErrorSourse = err.issues.map((issue: ZodIssue) => ({
        path: issue.path[issue.path.length - 1],
        message: issue.message
    }))

    return {
        success: false,
        statusCode: 400,
        message: 'Zod validation error',
        errorSourses,
        stack: config.node_environment === 'development' ? err?.stack : null
    }
}