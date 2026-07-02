import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AnalyticsServices } from "./analytics.service";

const trackEvent = catchAsync(async (req, res) => {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.ip;
  const userAgent = req.headers["user-agent"];
  const referrer = req.headers["referer"] || req.headers["referrer"];

  const eventData = {
    ...req.body,
    ip,
    userAgent,
    referrer,
    user: req.user?.id || undefined,
  };

  const event = await AnalyticsServices.createEventIntoDB(eventData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Event tracked successfully",
    data: event,
  });
});

const getAllEvents = catchAsync(async (req, res) => {
  const result = await AnalyticsServices.getAllEventsFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Events retrieved successfully",
    data: result.events,
    pagination: result.pagination,
  });
});

const getEventStats = catchAsync(async (req, res) => {
  const result = await AnalyticsServices.getEventStatsFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Stats retrieved successfully",
    data: result,
  });
});

const getProductStats = catchAsync(async (req, res) => {
  const result = await AnalyticsServices.getProductStatsFromDB(req.params.productId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Product stats retrieved successfully",
    data: result,
  });
});

const getTopProducts = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const result = await AnalyticsServices.getTopProductsFromDB(limit);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Top products retrieved successfully",
    data: result,
  });
});

export const AnalyticsController = {
  trackEvent,
  getAllEvents,
  getEventStats,
  getProductStats,
  getTopProducts,
};
