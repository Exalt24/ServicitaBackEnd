const express = require('express');
const router = express.Router();
const { sendOTPVerificationEmail } = require("./controller");
const UserOTPVerification = require('./model');
const verifyHashedData = require('../../util/verifyHashedData');
const User = require('../user/model');

router.post("/verifyOTP", async (req, res) => {
    try {
        let { userId, otp } = req.body;
        if (!userId || !otp) {
            throw Error("Empty OTP details are not allowed");
        } else {
            const UserOTPVerificationRecords = await UserOTPVerification.find({ userId });
            if (UserOTPVerificationRecords.length <= 0) {
                throw new Error(
                    "Account record doesn't exist or has been verified already."
                );
            } else {
                const { expiresAt } = UserOTPVerificationRecords[0];
                const hashedOTP = UserOTPVerificationRecords[0].otp;

                if (expiresAt < Date.now()) {
                    await UserOTPVerification.deleteMany({ userId });
                    throw new Error("Code has expired. Please request again.");
                } else {
                    const validOTP = await verifyHashedData(otp, hashedOTP);
                    if (!validOTP) {
                        throw new Error("Invalid code passed.")
                    } else {
                        await User.updateOne({ _id: userId }, { verified: true });
                        await UserOTPVerification.deleteMany({ userId });
                        res.status(200).json({ status: "SUCCESS", message: "Successful Verification"});
                    }
                }
            }
        }   
    } catch (error) {
        return res.status(400).json({ status: "FAILED", message: error.message });
    }
});

router.post("/resendOTPVerification", async (req, res) => {
    try {
        let { userId, email } = req.body;
        if ( !userId || !email ) {
            throw Error("Empty user details are not allowed");
        } else {
            await UserOTPVerification.deleteMany({ userId });
            const verifyOTPData = await sendOTPVerificationEmail({ _id: userId, email });
            res.status(202).json({ status: "PENDING", message: "OTP Verification Resent", data: verifyOTPData });
        }
    } catch (error) {
        return res.status(400).json({ status: "FAILED", message: error.message });
    }
})

module.exports = router;