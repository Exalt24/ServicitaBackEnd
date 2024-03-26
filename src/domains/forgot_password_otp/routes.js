const express = require('express');
const router = express.Router();
const { requestOTPPasswordReset, verifyOTP, changePassword, getTime} = require('./controller');
const PasswordResetOTP = require('./model');

router.post("/request", async (req, res) => {
    try {
        let { email } = req.body;
        const emailData = await requestOTPPasswordReset(email);
        res.status(202).json({ status: "PENDING", message: "Password Reset OTP Email Sent.", data: emailData });

;   } catch (error) {
        res.status(400).json({ status: "FAILED", message: error.message});
    }
});

router.post("/reset", async (req, res) => {
    try {
        let { email, otp } = req.body;
        const result = await verifyOTP(email, otp);
        res.status(200).json({ status: "SUCCESS", message: "OTP Verification Successful", data: result});
    } catch (error) {
        res.status(400).json({ status: "FAILED", message: error.message});
    }
});

router.patch("/actualReset", async (req, res) => {
    try {
        let { email, newPassword } = req.body;
        const result = await changePassword(email, newPassword);
        res.status(200).json({ status: "SUCCESS", message: "Password Reset Successful", data: result});
       
    } catch (error) {
        res.status(400).json({ status: "FAILED", message: error.message});
    }
})

router.get("/getRemainingCurrentTime/:email", async (req, res) => {
    try {
        let { email } = req.params;
        const result = await getTime(email);
        res.status(200).json({ status: "SUCCESS", message: "Remaining time for OTP", remainingTime: result});
    } catch (error) {
        res.status(400).json({ status: "FAILED", message: `Error getting remaining time: ${error.message}` });
    }
});

module.exports = router;