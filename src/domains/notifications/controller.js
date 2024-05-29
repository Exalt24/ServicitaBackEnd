const Notification = require('./model');

const create = async ( userId, title, message, otherUserId ) => {
   if (!userId || !title || !message ) {
       throw new Error('Missing required fields');
   }
    const notification = await Notification.create({
        userId,
        title,
        message,
        isRead: false,
        otherUserId,
        createdAt: new Date(),
        expiresAfter: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return notification;

}

const deleteNotification = async ( notificationId ) => {
    if (!notificationId) {
        throw new Error('Missing required fields');
    }
    const notification = await Notification.findByIdAndDelete(notificationId);

    return notification;
}

const getNotifications = async ( userId ) => {
    if (!userId) {
        throw new Error('Missing required fields');
    }

    const notifications = await Notification.find({ userId });
    
    return notifications;
}

const markAsRead = async ( notificationId ) => {
    if (!notificationId) {
        throw new Error('Missing required fields');
    }

    const notification = await Notification.findById(notificationId);
    notification.isRead = true;
    await notification.save();
    
    return notification;
}

module.exports = { create, getNotifications, markAsRead, deleteNotification };