const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PasswordResetOTPSchema = new Schema({
    email: String,
    otp: String,
    createdAt: Date,
    expiresAt: Date,
    expiresAfter: Date
});

const PasswordResetOTP = mongoose.model('PasswordResetOTP', PasswordResetOTPSchema);

module.exports = PasswordResetOTP;