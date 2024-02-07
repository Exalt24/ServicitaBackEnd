const path = require('path');
const express = require('express');
const { sendVerificationEmail } = require('./controller');
const verifyHashedData = require('../../util/verifyHashedData');
const UserVerification = require('./model');
const User = require('../user/model');
const router = express.Router();

// For Verifying Email
router.get('/verify/:userId/:uniqueString', async (req, res) => {
    try {
        let { userId, uniqueString } = req.params;

        if (!userId || !uniqueString) {
            throw Error("Empty details are not allowed");
        } else {
            const UserVerificationRecords = await UserVerification.find({ userId });
            if (!UserVerificationRecords.length) {
                throw new Error(
                    "Account record doesn't exist or has been verified already."
                );
            } else {
                const { expiresAt } = UserVerificationRecords[0];
                const hashedUniqueString = UserVerificationRecords[0].uniqueString;
                if (expiresAt < Date.now()) {
                    await UserVerification.deleteMany({ userId });
                    throw new Error("Verification link has expired.");
                } else {
                    const validString = await verifyHashedData(uniqueString, hashedUniqueString);
                    if (!validString) {
                        throw new Error("Invalid link.")
                    } else {
                        await User.updateOne({ _id: userId }, { verified: true });
                        await UserVerification.deleteMany({ userId });
                        res.sendFile(path.join(__dirname, "./views/verified.html"));
                    }
                }
            }
        }
    } catch (error) {
        res.redirect(`/email_verification/verified/error=true&message=${error.message}`)
        return res.status(400).json({ status: "FAILED", message: error.message });
    }
})

// Route for Verified Page
router.get("/verified", async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, "./views/verified.html"))
    } catch (error) {
        res.status(400).json({ status: "FAILED", message: error.message });
    }
})

router.post("/resendVerification", async (req, res) => {
    try {
        let { userId, email } = req.body;
        if ( !userId || !email ) {
            throw Error("Empty user details are not allowed");
        } else {
            await UserVerification.deleteMany({ userId });
            const verifyData =  await sendVerificationEmail({ _id: userId, email }, res);
            res.status(202).json({ status: "PENDING", message: "Verification Resent", data: verifyData });
        }
    } catch (error) {
        return res.status(400).json({ status: "FAILED", message: error.message });
    }
})

module.exports = router;