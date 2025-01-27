import { getIO } from "../../../socket";
import { TAdminAndUser } from "../../interface/customRequest";
import { TAdmin } from "../admin/admin.interface";
import { TNotification } from "./notification.interface";
import Notification from "./notification.model";

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
        const res = await Notification.create(noti);
        io.to(`${String(noti?.userTo)}`).emit("newNotification", {
          ...noti,
          userFrom: userFrom,
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
};
