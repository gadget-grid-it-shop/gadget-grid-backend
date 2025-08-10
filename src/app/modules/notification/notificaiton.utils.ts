import { getIO } from "../../../socket";
import { TAdminAndUser } from "../../interface/customRequest";
import { makeFullName } from "../../utils/makeFullName";
import { TAdmin } from "../admin/admin.interface";
import { Admin } from "../admin/admin.model";
import { TNotification } from "./notification.interface";
import Notification from "./notification.model";
import { ObjectId } from "mongodb";

export const buildNotifications = async ({
  thisAdmin,
  source,
  notificationType,
  actionType,
  text,
}: {
  thisAdmin: TAdminAndUser;
  source: ObjectId | string;
  text: string;
  notificationType: TNotification["notificationType"];
  actionType: TNotification["actionType"];
}): Promise<TNotification[]> => {
  const admins = await Admin.findAllVerifiedAdmins();
  const notifications: TNotification[] = admins.map((admin) => {
    const notification: TNotification = {
      notificationType: notificationType,
      actionType: actionType,
      opened: false,
      userFrom: thisAdmin?.user?._id,
      userTo: admin?.user?._id,
      source: String(source),
      text: `${
        String(admin.user._id) === String(thisAdmin.user?._id)
          ? "You"
          : makeFullName(thisAdmin.name)
      } ${text}`,
    };

    return notification;
  });

  return notifications;
};

export const addNotifications = async ({
  notifications,
  rooms,
  ignoreRooms,
  userFrom,
}: {
  notifications: TNotification[];
  rooms?: string[];
  ignoreRooms?: string[];
  userFrom?: TAdminAndUser;
}) => {
  const io = getIO();
  if (notifications && notifications.length > 0) {
    for (const noti of notifications) {
      try {
        const res = (await Notification.create(noti)).toObject();
        console.log(noti.userTo);
        io.to(`${noti?.userTo.toString()}`).emit("newNotification", {
          ...res,
          userFrom: userFrom,
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
};
