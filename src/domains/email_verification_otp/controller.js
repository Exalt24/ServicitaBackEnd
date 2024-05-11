const UserOTPVerification = require('./model');
const generateOTP = require('../../util/generateOTP');
const hashData = require('./../../util/hashData');
const sendEmail = require('../../util/sendEmail');
const verifyHashedData = require('../../util/verifyHashedData');
const fs = require('fs');
const { User, TempUser } = require('../user/model');




const sendOTPVerificationEmail = async ({ email, name }) => {
    if ( !email || !name ) {
        throw new Error("Missing required parameters for sending verification email.");
    }
    try {
        const tempUser = await TempUser.findOne({ email });
        const existingUser = await User.findOne({ email });
        if (tempUser) {
            throw new Error("Email has recently been verified but has not finished the registration process yet.");
        } else if (existingUser) {
            throw new Error("Email already exists in the system.");
        } else {
            const existingRecord = await UserOTPVerification.find({ email });
            if (existingRecord.length > 0) {
                await UserOTPVerification.deleteMany({ email });
            }
            const otp = await generateOTP();
            const htmlTemplate = fs.readFileSync('./src/pages/test.html', 'utf8');
            const replacedHTML = htmlTemplate.replace("{{OTP_PLACEHOLDER}}", otp).replace("{{NAME_PLACEHOLDER}}", name);
            const mailOptions = {
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Verify your Email Address",
                html: replacedHTML
            }
            const hashedOTP = await hashData(otp);
            const newOTPVerification = new UserOTPVerification({
                email: email,
                otp: hashedOTP,
                createdAt: Date.now(),
                expiresAt: Date.now() + 5 * 60 * 1000,
                expiresAfter: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });
            await newOTPVerification.save();
            await sendEmail(mailOptions);
            return { email };
        }
    } catch (error) {
        throw error;
    }
};

const verifyOTP = async ({ email, otp }) => {
    if (!email || !otp) {
        throw new Error("Missing required parameters for verifying OTP.");
    }
    try {
        const UserOTPVerificationRecords = await UserOTPVerification.find({ email });
        if (UserOTPVerificationRecords.length <= 0) {
            throw new Error("Email has been verified already.");
        } else {
            const { expiresAt } = UserOTPVerificationRecords[0];
            const hashedOTP = UserOTPVerificationRecords[0].otp;
            if (expiresAt < Date.now()) {
                await UserOTPVerification.deleteMany({ email });
                throw new Error("Code has expired. Please request again.");
            } else {
                const validOTP = await verifyHashedData(otp, hashedOTP);
                if (!validOTP) {
                    throw new Error("Invalid code passed.")
                } else {
                    await UserOTPVerification.deleteMany({ email });
                    return { status: "SUCCESS", message: "Successful Verification" };
                }
            }
        }
    } catch (error) {
        throw error;
    }
}

const getTime = async (email) => {
    if (!email) {
        throw new Error("Missing required parameters for getting remaining time.");
    }
    try {
        const UserOTPVerificationRecords = await UserOTPVerification.find({ email });
        if (UserOTPVerificationRecords.length <= 0) {
            throw new Error("Email has been verified already.")
        } else {
            const { expiresAt } = UserOTPVerificationRecords[0];
            const currentTime = new Date();
            const remainingTime = expiresAt - currentTime;
            return remainingTime;
        }
    } catch (error) {
        throw error;
    }

}

module.exports = { sendOTPVerificationEmail, verifyOTP, getTime };