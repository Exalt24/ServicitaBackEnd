const Booking = require('./model');

const createBooking = async (data) => {
    try {
        const { seekerId, providerId, location, serviceId, paymentMethod, price, startTime, endTime, status, expiresAt } = data;
        if ( !seekerId || !providerId || !location | !serviceId || !paymentMethod || !price || !startTime || !endTime || !status || !expiresAt) {
            throw new Error("Missing required parameters for booking creation.");
        }
        const newBooking = new Booking({
            seekerId,
            providerId,
            location,
            serviceId,
            paymentMethod,
            price,
            startTime,
            endTime,
            status,
            createdAt: new Date(),
            expiresAt,
        });
        const createdBooking = await newBooking.save();
        return createdBooking;
    } catch (error) {
        throw error;
    }
}

const getBookingsById = async (userId, role) => {
    try {
        let bookings;
        if (role === 'Seeker') {
            bookings = await Booking.find({ seekerId: userId });
        } else if (role === 'Provider') {
            bookings = await Booking.find({ providerId: userId });
        }
        return bookings;
    } catch (error) {
        throw error;
    }
}

module.exports = { createBooking, getBookingsById };


