const UserOTPVerification = require('./model');
const generateOTP = require('../../util/generateOTP');
const hashData = require('./../../util/hashData');
const sendEmail = require('../../util/sendEmail');

const sendOTPVerificationEmail = async ({ _id, email }) => {
    try {
        const otp = await generateOTP();
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify your Email Address",
            html: `<p>Verify your email address to complete the sign up process.</p>
            <p>This code <b>expires in 30 minutes</b>.</p>
            <p>Enter <b>${otp}</b> in the app to verify your email address and complete the process.`
        }
        // Hash the OTP
        const hashedOTP = await hashData(otp);
        const newOTPVerification = await new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 1800000
        });
        await newOTPVerification.save();
        await sendEmail(mailOptions);
        return {
            userId: _id,
            email
        }
    } catch (error) {
        throw error;
    }
};

// const verifyOTPEmail = async ({ _id, otp }) => {
//     try {
//         const UserOTPVerificationRecords = await UserOTPVerification.find({ _id });
//         if (UserOTPVerificationRecords.length <= 0) {
//             throw new Error(
//                 "Account record doesn't exist or has been verified already."
//             );
//         } else {
//             const { expiresAt } = UserOTPVerificationRecords[0];
//             const hashedOTP = UserOTPVerificationRecords[0].otp;

//             if (expiresAt < Date.now()) {
//                 await UserOTPVerification.deleteMany({ userId });
//                 throw new Error("Code has expired. Please request again.");
//             } else {
//                 const validOTP = await verifyHashedData(otp, hashedOTP);
//                 if (!validOTP) {
//                     throw new Error("Invalid code passed.")
//                 } else {
//                     const user = await User.updateOne({ _id: userId }, { verified: true });
//                     await UserOTPVerification.deleteMany({ userId });
//                     return {
//                         userId: _id,
//                         name: user.name,
//                         email: user.email,
//                         verified: user.verified
//                     }
//                 }
//             }
//         }
//     } catch (error) {
//         console.error(error);
//         throw error;
//     }
// }

module.exports = { sendOTPVerificationEmail };