const express = require('express');
const router = express.Router();

const userRoutes = require('./../domains/user')
const EmailVerificationOTPRoutes = require("./../domains/email_verification_otp");
const ForgotPasswordRoutesOTPRoutes = require("./../domains/forgot_password_otp");

router.use('/user', userRoutes);
router.use('/email_verification_otp', EmailVerificationOTPRoutes);
router.use('/forgot_password_otp', ForgotPasswordRoutesOTPRoutes);

module.exports = router;