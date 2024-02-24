const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
// Custom Functions
const { createNewUser, authenticateUser } = require('./controller');
// const { validateSignupInputs } = require('../../middleware/signupvalidation');
const { sendOTPVerificationEmail } = require('./../email_verification_otp/controller')
// const { validateLoginInputs } = require('../../middleware/loginvalidation');
const { sendVerificationEmail } = require('../email_verification/controller');
const User = require('./model');

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, mobile, password, dateOfBirth} = req.body;
        const newUser = await createNewUser({
            name,
            email,
            mobile,
            password,
            dateOfBirth,
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
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const authenticatedUser = await authenticateUser(email, password);
        const token = jwt.sign({ email: authenticatedUser[0].email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            status: "SUCCESS",
            message: "Login Successful",
            data: token
        })
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
});

router.post('/userdata', async (req, res) => {
    const { token } = req.body;
    try {
        const decoded = await jwt.verify(token, JWT_SECRET);
        const userEmail = decoded.email;
        User.findOne({ email: userEmail }).then(data => {
            res.status(200).json({
                status: "SUCCESS",
                message: "Token Verified",
                data: decoded
        })
        });
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
})

module.exports = router;