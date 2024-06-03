const express = require('express');
const router = express.Router();
const { sendOTPVerificationEmail, verifyOTP, getTime, sendConfirmationEmail, sendReceiptEmail } = require("./controller");


router.post("/sendEmail", async (req, res) => {
    try {
        let { email, name } = req.body;
        const emailData = await sendOTPVerificationEmail({ email, name });
        res.status(202).json({ status: "PENDING", message: "Verification Email Sent", data: emailData });
    } catch (error) {
        console.log(error);
        res.status(400).json({ status: "FAILED", message: error.message });
    }
})

router.post("/verifyOTP", async (req, res) => {
    try {
        let { email, otp } = req.body;
        const verifyOTPData = await verifyOTP({ email, otp });
        res.status(200).json({ status: "SUCCESS", message: "Successful Verification", data: verifyOTPData});
    } catch (error) {
        res.status(400).json({ status: "FAILED", message: error.message });
    }
});

router.post("/sendConfirmationEmail", async (req, res) => {
    try {
        let { email, name, role } = req.body;
        console.log(req.body)
        const emailData = await sendConfirmationEmail({ email, name, role });
        res.status(202).json({ status: "PENDING", message: "Confirmation Email Sent", data: emailData });
    } catch (error) {
        console.log(error);
        res.status(400).json({ status: "FAILED", message: error.message });
    }
});

router.get("/getRemainingCurrentTime/:email", async (req, res) => {
    try {
        let { email } = req.params;
        const remainingTime = await getTime(email);
        res.status(200).json({ status: "SUCCESS", message: "Remaining time for OTP", remainingTime });
    } catch (error) {
        res.status(400).json({ status: "FAILED", message: error.message });
    }
});

router.post('/sendReceipt', async (req, res) => {
    try {
        let { email, name, bookingId, providerName, location, date, time, transactionId, createdAt, expiresAt, paymentMethod, amount } = req.body;
        console.log(req.body)
        const sendReceipt = await sendReceiptEmail({email, name, bookingId, providerName, location, date, time, transactionId, createdAt, expiresAt, paymentMethod, amount});
        console.log(sendReceipt)
        res.status(200).json({
            status: "SUCCESS",
            message: "Receipt Sent",
            data: sendReceipt
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    
    }
})

module.exports = router;