import {RequestHandler} from "express";
import {AnyZodObject} from "zod";

const validateRequest = (zSchema: AnyZodObject): RequestHandler => {
  return async (req, res, next) => {
    const data = req.body;
    try {
      zSchema.parseAsync(data);
      next();
    } catch (err) {
      next(err);
    }
  };
};
