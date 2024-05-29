const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    userId: String,
    title: String,
    message: String,
    isRead: Boolean,
    otherUserId: String,
    createdAt: Date,
    expiresAfter: Date,
});

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
