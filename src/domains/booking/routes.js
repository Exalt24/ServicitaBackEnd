const express = require('express');
const Booking = require('./model');
const router = express.Router();
const { createBooking, getBookingsById } = require('./controller');

router.post('/createBooking', async (req, res) => {
    try {
        const { seekerId, providerId, location, serviceId, paymentMethod, price, startTime, endTime, expiresAt } = req.body;
        const newBooking = await createBooking({
            seekerId,
            providerId,
            location,
            serviceId,
            paymentMethod,
            price,
            startTime,
            endTime,
            status: "PROCESSING",
            expiresAt,
        });
        res.status(200).json({
            status: "SUCCESS",
            message: "Booking Created Successfully",
            data: newBooking
        });
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
})

router.post('/getBookingsByUser', async (req, res) => {
    try {
        const { userId, role } = req.body;
        const bookings = await getBookingsById(userId, role);
        bookings.forEach(async booking => {
            if (booking.expiresAt < new Date()) {
                Booking.findOneAndUpdate({ _id: booking._id }, { status: "EXPIRED" });
            }
        })
        const updatedBookings = await getBookingsById(userId, role);
        res.status(200).json({
            status: "SUCCESS",
            message: "Bookings Found",
            data: updatedBookings
        });
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
})

module.exports = router;