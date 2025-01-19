import { TNotification } from "./notification.interface";
import Notification from "./notification.model";
import { ObjectId } from 'mongodb';

const addNotificationToDB = async (payload: TNotification) => {
    const result = await Notification.create(payload)
    return result
}

const getMyNotificationsFromDB = async (user: string) => {
    const result = await Notification.find({ userTo: new ObjectId(user) })
    return result
}
export const NotificationService = { addNotificationToDB, getMyNotificationsFromDB } 