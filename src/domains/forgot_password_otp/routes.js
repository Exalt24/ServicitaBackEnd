const express = require('express');
const router = express.Router();
const { requestOTPPasswordReset, sendOTPPasswordResetEmail} = require('./controller');
const verifyHashedData = require('../../util/verifyHashedData');
const PasswordResetOTP = require('./model');
const { User, TempUser } = require('../user/model');
const hashData = require('../../util/hashData');

// For Requesting Password Reset
router.post("/request", async (req, res) => {
    try {
        const { email } = req.body
        
        if (!email) throw Error ("Empty credentials are not allowed.");
        const emailData = await requestOTPPasswordReset(email);
        res.status(202).json({ status: "PENDING", message: "Password Reset OTP Email Sent.", data: emailData });

;   } catch (error) {
        console.log("Error: ", error.message);
        res.status(400).json({ status: "FAILED", message: error.message});
    }
});

// For Actual Password Reset
router.post("/reset", async (req, res) => {
    try {
        let { userId, otp, newPassword } = req.body;

        if (!userId || !otp || !newPassword) {
            throw Error("Invalid parameters for password reset.");
        }

        const resetRecord = await PasswordResetOTP.find({ userId });

        if (resetRecord.length <= 0) {
            throw Error("Password Reset Request not found.");
        } else {
            const { expiresAt } = resetRecord[0];
            const hashedOTP = resetRecord[0].otp;
    
            if (expiresAt < Date.now()) {
                // Password reset link has expired
                await PasswordResetOTP.deleteOne({ userId });
                throw Error("Password reset link has expired.");
            }
            // Compare provided hashedOTP with stored hashedOTP
            const isOTPValid = await verifyHashedData(otp, hashedOTP);
    
            if (!isOTPValid) {
                throw Error("Invalid code passed.");
            } else {
                const hashedNewPassword = await hashData(newPassword);
                await User.updateOne({ _id: userId }, { password: hashedNewPassword });
                await PasswordResetOTP.deleteOne({ userId });
                res.status(200).json({ status: "SUCCESS", message: "OTP Verification Successful"});
            }  
        }
    } catch (error) {
        res.status(400).json({ status: "FAILED", message: error.message});
    }
});

router.post("/actualReset", async (req, res) => {
    try {
        let { userId, newPassword } = req.body;
        if (!userId || !newPassword) {
            throw Error("Invalid parameters for password reset.");
        }
        const hashedNewPassword = await hashData(newPassword);
        await User.updateOne({ _id: userId }, { password: hashedNewPassword });
        res.status(200).json({ status: "SUCCESS", message: "Password Reset Successful"});
       
    } catch (error) {
        res.status(400).json({ status: "FAILED", message: error.message});
    }
})

router.post("/resendOTPPasswordReset", async (req, res) => {
    try {
        let { userId, email } = req.body;
        if ( !userId || !email ) {
            throw Error("Empty user details are not allowed");
        } else {
            await PasswordResetOTP.deleteMany({ userId });
            sendOTPPasswordResetEmail({ _id: userId, email }, res);
            res.status(202).json({ status: "PENDING", message: "OTP Verification Resent", data: verifyOTPData });
        }
    } catch (error) {
        return res.status(400).json({ status: "FAILED", message: error.message });
    }
})

router.get("/getRemainingCurrentTime/:userId", async (req, res) => {
    try {
        let { userId } = req.params;
        if (!userId) {
            throw new Error("Missing userId parameter");
        } else {
            const PasswordOTPVerificationRecords = await PasswordResetOTP.find({ userId });
            if (PasswordOTPVerificationRecords.length <= 0) {
                throw Error(
                    "Account record doesn't exist or has been verified already."
                )
            } else {
                const { expiresAt } = PasswordOTPVerificationRecords[0];
                const currentTime = new Date();
                const remainingTime = expiresAt - currentTime;
                console.log("Remaining Time: ", remainingTime);
                res.status(200).json({ remainingTime });
            }
        }
    } catch (error) {
        res.status(400).json({ status: "FAILED", message: `Error getting remaining time: ${error.message}` });
        console.log("Error getting remaining time: ", error.message);
    }
});

module.exports = router;