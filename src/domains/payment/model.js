const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    paymentMethod: {
        name: String,
        type: String,
    },
    seekerId: String,
    providerId: String,
    bookingId: String,
    status: String,
    createdAt: Date,
    expiresAt: Date,
    expiresAfter: Date,
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;