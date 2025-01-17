import { TNotification } from "./notification.interface";
import Notification from "./notification.model";

const addNotificationToDB = async (payload: TNotification) => {
    const result = await Notification.create(payload)

    return result
}



export const NotificationService = { addNotificationToDB } 