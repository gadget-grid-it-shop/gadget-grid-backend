import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const message = err.message || "Something went wrong";

  console.log(err)

  res.status(500).json({
    success: false,
    message,
    error: err,
  });
};
