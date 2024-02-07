const express = require('express');
const router = express.Router();

// Custom Functions
const { createNewUser, authenticateUser } = require('./controller');
const { validateSignupInputs } = require('../../middleware/signupvalidation');
const { sendOTPVerificationEmail } = require('./../email_verification_otp/controller')
const { validateLoginInputs } = require('../../middleware/loginvalidation');
const { sendVerificationEmail } = require('../email_verification/controller');

// Signup
router.post('/signup', validateSignupInputs, async (req, res) => {
    try {
        const { name, email, password, dateOfBirth } = req.body;
        const newUser = await createNewUser({
            name,
            email,
            password,
            dateOfBirth
        });
        const emailData = await sendVerificationEmail(newUser);
        // const emailData = await sendOTPVerificationEmail(newUser);
        res.status(202).json({
            status: "PENDING",
            message: "Verification Email Sent",
            data: emailData
        });
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
});

// For Logging In
router.post('/login', validateLoginInputs, async (req, res) => {
    try {
        const { email, password } = req.body;
        const authenticatedUser = await authenticateUser(email, password);
        res.status(200).json({
            status: "SUCCESS",
            message: "Login Successful",
            data: authenticatedUser
        })
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
});

module.exports = router;