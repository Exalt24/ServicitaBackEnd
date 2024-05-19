const express = require('express');
const router = express.Router();

const userRoutes = require('./../domains/user')
const EmailVerificationOTPRoutes = require("./../domains/email_verification_otp");
const ForgotPasswordRoutesOTPRoutes = require("./../domains/forgot_password_otp");
const adminRoutes = require('./../domains/admin');
const locationRoutes = require('./../domains/location');
const serviceRoutes = require('./../domains/service');
const paymentRoutes = require('./../domains/payment');
const postRoutes = require('./../domains/post');
const ratingRoutes = require('./../domains/rating');
const reportRoutes = require('./../domains/report');
const aiRoutes = require('./../domains/ai');
const notificationRoutes = require('./../domains/notifications');

router.use('/user', userRoutes);
router.use('/email_verification_otp', EmailVerificationOTPRoutes);
router.use('/forgot_password_otp', ForgotPasswordRoutesOTPRoutes);
router.use('/admin', adminRoutes);
router.use('/location', locationRoutes);
router.use('/service', serviceRoutes);
router.use('/payment', paymentRoutes);
router.use('/post', postRoutes);
router.use('/rating', ratingRoutes);
router.use('/report', reportRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;