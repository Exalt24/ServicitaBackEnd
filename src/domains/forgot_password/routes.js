const express = require('express');
const router = express.Router();
const { requestPasswordReset, sendPasswordResetEmail} = require('./controller');
const PasswordReset = require('./model');
const verifyHashedData = require('../../util/verifyHashedData');
const hashData = require('../../util/hashData');
const User = require('../user/model');

// For Requesting Password Reset
router.post("/request", async (req, res) => {
    try {
        const { email } = req.body
        
        if (!email) throw Error ("Empty credentials are not allowed.");
        const emailData = await requestPasswordReset(email);
        res.status(202).json({ status: "PENDING", message: "Password Reset Email Sent.", data: emailData });

;   } catch (error) {
        res.status(400).json({ status: "FAILED", message: error.message});
    }
});

// For Actual Password Reset
router.post("/reset", async (req, res) => {
    try {
        let { userId, resetString, newPassword } = req.body;

        if (!userId || !resetString || !newPassword) {
            throw Error("Invalid parameters for password reset.");
        } else {
            const resetRecord = await PasswordReset.find({ userId });

            if (resetRecord.length <= 0) {
                throw new Error("Password Reset Request not found.");
            } else {
                const { expiresAt } = resetRecord[0];
                const hashedResetString = resetRecord[0].resetString;
        
                if (expiresAt < Date.now()) {
                    // Password reset link has expired
                    await PasswordReset.deleteOne({ userId });
                    throw new Error("Password reset link has expired.");
                }
                // Compare provided hashed Reset String with stored hashed reset string
                const valid = resetString.trim() === hashedResetString.trim();
                if (!valid) {
                    throw new Error("Invalid details passed.");
                } else {
                    const hashedNewPassword = await hashData(newPassword);
                    const user = await User.updateOne({ _id: userId }, { password: hashedNewPassword });
                    await PasswordReset.deleteOne({ userId });
                    res.status(200).json({ status: "SUCCESS", message: "Password Reset Successful"});
                }  
            }
            }
    } catch (error) {
        res.status(400).json({ status: "FAILED", message: error.message});
    }
});

router.post("/resendPasswordReset", async (req, res) => {
    try {
        let { userId, email } = req.body;
        if ( !userId || !email ) {
            throw Error("Empty user details are not allowed");
        } else {
            await PasswordReset.deleteMany({ userId });
            sendPasswordResetEmail({ _id: userId, email }, res);
            res.status(202).json({ status: "PENDING", message: "Password Reset Resent"});
        }
    } catch (error) {
        return res.status(400).json({ status: "FAILED", message: error.message });
    }
})

module.exports = router;