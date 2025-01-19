import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { NotificationService } from "./notification.service";

const getMyNotifications = catchAsync(async (req, res) => {
    const user = req.user.userData._id
    const result = await NotificationService.getMyNotificationsFromDB(user)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Fetched my notificatins',
        data: result
    })
})

export const NotificationContoller = { getMyNotifications }