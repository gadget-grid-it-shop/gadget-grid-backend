import Order from "../order/order.model";

const getDashboardAnalyticsFromDB = async (year?: string) => {
  const selectedYear = year
    ? parseInt(year as string)
    : new Date().getFullYear();

  const startOfYear = new Date(`${selectedYear}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${selectedYear + 1}-01-01T00:00:00.000Z`);

  // Match orders from selected year
  const matchStage = {
    createdAt: { $gte: startOfYear, $lt: endOfYear },
  };

  // 1. Monthly Revenue & Orders (12 months guaranteed)
  const monthlyStats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    {
      $project: {
        monthNum: "$_id",
        revenue: 1,
        orders: 1,
        _id: 0,
      },
    },
    { $sort: { monthNum: 1 } },
  ]);

  // Fill missing months with 0s
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyMap = new Map(monthlyStats.map((m) => [m.monthNum, m]));
  const fullMonthlyStats = monthNames.map((name, idx) => {
    const data = monthlyMap.get(idx + 1);
    return {
      month: name,
      revenue: data?.revenue || 0,
      orders: data?.orders || 0,
    };
  });

  // 2. Order Status Distribution
  const orderStatusDistribution = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$currentStatus",
        value: { $sum: 1 },
      },
    },
    {
      $project: {
        name: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id", "pending"] }, then: "Pending" },
              { case: { $eq: ["$_id", "confirmed"] }, then: "Confirmed" },
              { case: { $eq: ["$_id", "processing"] }, then: "Processing" },
              { case: { $eq: ["$_id", "shipped"] }, then: "Shipped" },
              { case: { $eq: ["$_id", "delivered"] }, then: "Delivered" },
              { case: { $eq: ["$_id", "cancelled"] }, then: "Cancelled" },
              { case: { $eq: ["$_id", "returned"] }, then: "Returned" },
            ],
            default: "$_id",
          },
        },
        value: 1,
      },
    },
    { $sort: { value: -1 } },
  ]);

  // 3. Payment Method Distribution
  const paymentMethodDistribution = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$paymentMethod",
        value: { $sum: 1 },
      },
    },
    {
      $project: {
        name: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id", "cod"] }, then: "COD" },
              { case: { $eq: ["$_id", "card"] }, then: "Card" },
              { case: { $eq: ["$_id", "paypal"] }, then: "PayPal" },
              {
                case: { $eq: ["$_id", "bank_transfer"] },
                then: "Bank Transfer",
              },
            ],
            default: "$_id",
          },
        },
        value: 1,
      },
    },
  ]);

  // 4. Payment Status Distribution
  const paymentStatusDistribution = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$paymentStatus",
        value: { $sum: 1 },
      },
    },
    {
      $project: {
        name: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id", "paid"] }, then: "Paid" },
              { case: { $eq: ["$_id", "pending"] }, then: "Pending" },
              { case: { $eq: ["$_id", "failed"] }, then: "Failed" },
              { case: { $eq: ["$_id", "refunded"] }, then: "Refunded" },
            ],
            default: "$_id",
          },
        },
        value: 1,
      },
    },
  ]);

  // 5. Shipping Method Distribution
  const shippingMethodDistribution = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$shippingMethod",
        value: { $sum: 1 },
      },
    },
    {
      $project: {
        name: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id", "standard"] }, then: "Standard" },
              { case: { $eq: ["$_id", "express"] }, then: "Express" },
              { case: { $eq: ["$_id", "overnight"] }, then: "Overnight" },
            ],
            default: "$_id",
          },
        },
        value: 1,
      },
    },
  ]);

  // 6. Order Amount Distribution
  const orderAmountDistribution = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lt: ["$totalAmount", 100] }, then: "$0-100" },
              { case: { $lt: ["$totalAmount", 300] }, then: "$100-300" },
              { case: { $lt: ["$totalAmount", 500] }, then: "$300-500" },
              { case: { $lt: ["$totalAmount", 1000] }, then: "$500-1000" },
            ],
            default: "$1000+",
          },
        },
        orders: { $sum: 1 },
      },
    },
    {
      $project: {
        range: "$_id",
        orders: 1,
        _id: 0,
      },
    },
    {
      $sort: {
        range: 1,
      },
    },
  ]);

  // 7. Top Selling Products
  const topProducts = await Order.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },

    {
      $group: {
        _id: "$items.productId",
        sales: { $sum: "$items.quantity" },
        revenue: {
          $sum: { $multiply: ["$items.quantity", "$items.finalPrice"] },
        },
      },
    },

    // Lookup actual product name from Product collection
    {
      $lookup: {
        from: "products", // your collection name
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    {
      $project: {
        name: "$product.name",
        sales: 1,
        revenue: 1,
      },
    },

    { $sort: { sales: -1 } },
    { $limit: 5 },
  ]);

  return {
    monthlyStats: fullMonthlyStats,
    orderStatusDistribution,
    paymentMethodDistribution,
    paymentStatusDistribution,
    shippingMethodDistribution,
    orderAmountDistribution,
    topProducts,
  };
};

export const DashboardService = {
  getDashboardAnalyticsFromDB,
};
