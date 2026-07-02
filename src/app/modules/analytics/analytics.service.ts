import { AnalyticsEvent } from "./analytics.model";
import { IAnalyticsEvent } from "./analytics.interface";
import QueryBuilder from "../../builder/queryBuilder";
import { TPagination } from "../product/product.interface";
import { Product } from "../product/product.model";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const excludeFields = ["searchTerm", "sort", "limit", "page", "fields"];

const createEventIntoDB = async (
  payload: Partial<IAnalyticsEvent>,
): Promise<IAnalyticsEvent> => {
  const event = await AnalyticsEvent.create(payload);
  return event;
};

const getAllEventsFromDB = async (query: Record<string, unknown>) => {
  const analyticsQuery = new QueryBuilder(
    AnalyticsEvent.find().populate("product user"),
    query,
  )
    .search(["eventType", "pageUrl", "productName"])
    .filter(excludeFields)
    .sort()
    .fields();

  await analyticsQuery.paginate();

  const events = await analyticsQuery.modelQuery;

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const pagination: TPagination = {
    total: analyticsQuery.total,
    currentPage: page,
    limit,
    hasMore: events.length === limit,
    totalPage: Math.ceil(analyticsQuery.total / limit),
  };

  return { events, pagination };
};

const getEventStatsFromDB = async (query: Record<string, unknown>) => {
  const matchStage: Record<string, unknown> = {};

  if (query.eventType) {
    matchStage.eventType = query.eventType;
  }

  if (query.startDate || query.endDate) {
    matchStage.createdAt = {};
    if (query.startDate) {
      (matchStage.createdAt as Record<string, unknown>).$gte = new Date(
        query.startDate as string,
      );
    }
    if (query.endDate) {
      (matchStage.createdAt as Record<string, unknown>).$lte = new Date(
        query.endDate as string,
      );
    }
  }

  const stats = await AnalyticsEvent.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$eventType",
        count: { $sum: 1 },
        uniqueVisitors: { $addToSet: "$visitorId" },
        uniqueSessions: { $addToSet: "$sessionId" },
      },
    },
    {
      $project: {
        eventType: "$_id",
        count: 1,
        uniqueVisitors: { $size: "$uniqueVisitors" },
        uniqueSessions: { $size: "$uniqueSessions" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const totalEvents = stats.reduce(
    (sum: number, s: { count: number }) => sum + s.count,
    0,
  );

  return { stats, totalEvents };
};

const getProductStatsFromDB = async (productId: string) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Product with id ${productId} not found`,
    );
  }

  const stats = await AnalyticsEvent.aggregate([
    { $match: { productSlug: product.slug as any } },
    {
      $group: {
        _id: "$eventType",
        count: { $sum: 1 },
        uniqueVisitors: { $addToSet: "$visitorId" },
        uniqueSessions: { $addToSet: "$sessionId" },
        totalRevenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$eventType", "purchase"] },
                  { $ifNull: ["$productPrice", false] },
                ],
              },
              "$productPrice",
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        eventType: "$_id",
        count: 1,
        uniqueVisitors: { $size: "$uniqueVisitors" },
        uniqueSessions: { $size: "$uniqueSessions" },
        totalRevenue: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  const total = stats.reduce(
    (sum: number, s: { count: number }) => sum + s.count,
    0,
  );

  return { stats, totalEvents: total };
};

const getTopProductsFromDB = async (limit: number = 10) => {
  const topProducts = await AnalyticsEvent.aggregate([
    {
      $group: {
        _id: {
          product: "$product",
          productSlug: "$productSlug",
          productName: "$productName",
        },
        pageViews: {
          $sum: { $cond: [{ $eq: ["$eventType", "pageView"] }, 1, 0] },
        },
        addToCarts: {
          $sum: { $cond: [{ $eq: ["$eventType", "addToCart"] }, 1, 0] },
        },
        purchases: {
          $sum: { $cond: [{ $eq: ["$eventType", "purchase"] }, 1, 0] },
        },
        uniqueVisitors: { $addToSet: "$visitorId" },
        revenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$eventType", "purchase"] },
                  { $ifNull: ["$productPrice", false] },
                ],
              },
              "$productPrice",
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        product: "$_id.product",
        productSlug: "$_id.productSlug",
        productName: "$_id.productName",
        pageViews: 1,
        addToCarts: 1,
        purchases: 1,
        uniqueVisitors: { $size: "$uniqueVisitors" },
        revenue: 1,
        conversionRate: {
          $cond: [
            { $gt: ["$pageViews", 0] },
            { $multiply: [{ $divide: ["$purchases", "$pageViews"] }, 100] },
            0,
          ],
        },
      },
    },
    { $sort: { pageViews: -1 } },
    { $limit: limit },
  ]);

  return topProducts;
};

export const AnalyticsServices = {
  createEventIntoDB,
  getAllEventsFromDB,
  getEventStatsFromDB,
  getProductStatsFromDB,
  getTopProductsFromDB,
};
