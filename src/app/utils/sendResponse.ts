import {Response} from "express";

type TResponseData<T> = {
  data: T;
  success?: boolean;
  statusCode: number;
  message?: string;
};

const sendResponse = <T>(res: Response, data: TResponseData<T>) => {
  res.status(data.statusCode).json({
    statusCode: data.statusCode,
    success: data.success,
    message: data.message,
    data: data.data,
  });
};

export default sendResponse;
