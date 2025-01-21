import QueryBuilder from "../../builder/queryBuilder";
import { TNotification } from "./notification.interface";
import Notification from "./notification.model";
import { ObjectId } from "mongodb";

const addNotificationToDB = async (payload: TNotification) => {
  const result = await Notification.create(payload);
  return result;
};

const getMyNotificationsFromDB = async (user: string) => {
  const unreadCount = await Notification.countDocuments({
    userTo: new ObjectId(user),
    opened: false,
  });

  const query = {
    page: 1,
    limit: 20,
  };

  const notificationQuery = new QueryBuilder(
    Notification.find({ userTo: new ObjectId(user) }),
    query
  ).sort();

  await notificationQuery.paginate();

  const result = await notificationQuery.modelQuery.populate([
    {
      path: "userTo",
    },
    {
      path: "userFrom",
    },
  ]);

  return {
    notifications: result,
    unreadCount,
  };
};
export const NotificationService = {
  addNotificationToDB,
  getMyNotificationsFromDB,
};
