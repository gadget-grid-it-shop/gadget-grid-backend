import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError, ZodIssue } from "zod";
import { TErrorSourse } from "../interface/error.interface";
import { handleZodError } from "../errors/handleZodError";
import { handleCastError } from "../errors/handleCastError";
import handleDuplicateError from "../errors/handleDuplicateError";
import handleMulterError from "../errors/handleMulterError";



export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let message = err.message || "Something went wrong";
  let statusCode = err.statusCode || 500

  let errorSources: TErrorSourse = [{
    path: "",
    message: "Something went wrong"
  }]


  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err)
    res.status(simplifiedError.statusCode).json(simplifiedError)
    return
  }


  if (err?.name === 'CastError') {
    const simplifiedError = handleCastError(err)
    res.status(simplifiedError.statusCode).json(simplifiedError)
    return
  }


  if (err.code === 11000) {
    const simplifiedError = handleDuplicateError(err)
    res.status(simplifiedError.statusCode).json(simplifiedError)
    return
  }


  if (err.name === "MulterError") {
    const simplifiedError = handleMulterError(err)
    res.status(simplifiedError.statusCode).json(simplifiedError)
    return
  }


  res.status(statusCode).json({
    success: false,
    message,
    err,
  });
};
