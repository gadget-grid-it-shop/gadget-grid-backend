import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { NotificationService } from "./notification.service";

const getMyNotifications = catchAsync(async (req, res) => {
  const user = req.user.userData._id;
  const query = req.query;
  const result = await NotificationService.getMyNotificationsFromDB(
    user,
    query,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Fetched my notificatins",
    data: result.data,
    pagination: result.pagination,
  });
});

const markNotificationAsSeen = catchAsync(async (req, res) => {
  const user = req.user.userData._id;
  const id = req.params.id;
  const result = await NotificationService.markNotificationAsSeenToDB(id, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Marked as seen",
    data: result,
  });
});
const markAllNotificationSeen = catchAsync(async (req, res) => {
  const user = req.user.userData._id;
  const result = await NotificationService.markAllNotificationSeenToDB(user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Marked all as seen",
    data: result,
  });
});

export const NotificationContoller = {
  getMyNotifications,
  markNotificationAsSeen,
  markAllNotificationSeen,
};
