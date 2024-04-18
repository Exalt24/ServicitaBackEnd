const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    seekerId: String,
    providerId: String,
    location: String,
    serviceId: String,
    startTime: String,
    endTime: String,
    status: String,
    paymentMethod: String,
    price: Number,
    createdAt: Date,
    expiresAt: Date,
});

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking; 