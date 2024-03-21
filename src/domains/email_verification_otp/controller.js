const UserOTPVerification = require('./model');
const generateOTP = require('../../util/generateOTP');
const hashData = require('./../../util/hashData');
const sendEmail = require('../../util/sendEmail');

const sendOTPVerificationEmail = async ({ _id, email }) => {
    if (!_id || !email) {
        throw new Error("Missing required parameters for sending verification email.");
    }
    
    try {
        const otp = await generateOTP();
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify your Email Address",
            html: `<p>Verify your email address to complete the sign up process.</p>
            <p>This code <b>expires in 5 minutes</b>.</p>
            <p>Enter <b>${otp}</b> in the app to verify your email address and complete the process.`
        }
        const hashedOTP = await hashData(otp);
        const newOTPVerification = new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 5 * 60 * 1000,
            expiresAfter: new Date(Date.now() + 5 * 60 * 1000)
        });
        await newOTPVerification.save();
        await sendEmail(mailOptions);
        console.log("Verification email sent to:", email);
        return {
            userId: _id,
            email
        }
    } catch (error) {
        throw error;
    }
};

module.exports = { sendOTPVerificationEmail };