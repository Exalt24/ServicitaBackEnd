const express = require('express');
const router = express.Router();
const { create, getNotifications, markAsRead, deleteNotification } = require('./controller');

router.post('/create', async (req, res) => {
    try {
        const { userId, title, message } = req.body;
        const notification = await create(userId, title, message);
        res.status(200).json({ status: 'SUCCESS', data: notification });
    } catch (error) {
        res.status(400).json({ status: 'FAILED', message: error.message });
    }
}
);

router.get('/getNotifications/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await getNotifications(userId);
        res.status(200).json({ status: 'SUCCESS', data: notifications });
    } catch (error) {
        res.status(400).json({ status: 'FAILED', message: error.message });
    }
}
);

router.post('/markAsRead', async (req, res) => {
    try {
        const { notificationId } = req.body;
        const notification = await markAsRead(notificationId);
        res.status(200).json({ status: 'SUCCESS', data: notification });
    } catch (error) {
        res.status(400).json({ status: 'FAILED', message: error.message });
    }
}
);

router.delete('/deleteNotification', async (req, res) => {
    try {
        const { notificationId } = req.body;
        const notification = await deleteNotification(notificationId);
        res.status(200).json({ status: 'SUCCESS', data: notification });
    } catch (error) {
        res.status(400).json({ status: 'FAILED', message: error.message });
    }
}
);

module.exports = router;

