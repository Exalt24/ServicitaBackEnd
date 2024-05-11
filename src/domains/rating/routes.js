const express = require('express');
const router = express.Router();
const { createRating, getRatingsByUser, getRatingsByService, getRatingByBooking} = require('./controller');

router.post('/createRating', async (req, res) => {
    try {
        const { bookingId, rating, comment, serviceId, seekerId, providerId, images, seekerImage, seekerName} = req.body;

        const newRating = await createRating(bookingId, rating, comment, serviceId, seekerId, providerId, images, seekerImage, seekerName);
        res.status(200).json({
            status: "SUCCESS",
            message: "Rating Created Successfully",
            data: newRating
        });
    } catch (error) {
        // console.log(error);
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
}
);

router.post('/getRatingsByUser', async (req, res) => {
    try {
        const { userId } = req.body;
        const ratings = await getRatingsByUser(userId);
        res.status(200).json({
            status: "SUCCESS",
            message: "Ratings Found",
            data: ratings
        });
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
}
);

router.post('/getRatingsByService', async (req, res) => {
    try {
        const { serviceId } = req.body;
        const ratings = await getRatingsByService(serviceId);
        res.status(200).json({
            status: "SUCCESS",
            message: "Ratings Found",
            data: ratings
        });
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
}
);

router.post('/getRatingByBookingId', async (req, res) => {
    try {
        const { bookingId } = req.body;
        const rating = await getRatingByBooking(bookingId);
        res.status(200).json(rating);
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
});

module.exports = router;