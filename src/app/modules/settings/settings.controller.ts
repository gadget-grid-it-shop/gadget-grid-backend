import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { SettingsService } from "./settings.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

// Get settings (create if not exists)
export const getSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await SettingsService.getSettingsFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Settings retrived successfully",
    data: result,
  });
});

// Update settings
export const updateSettings = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SettingsService.updateSettingsToDB(
      req.user.id,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Settings updated successfully",
      data: result,
    });
  }
);
