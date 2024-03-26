const PasswordResetOTP = require('./model');
const { User } = require('./../user/model');
const hashData = require('./../../util/hashData');
const sendEmail = require('./../../util/sendEmail');
const generateOTP = require('./../../util/generateOTP');
const verifyHashedData = require('./../../util/verifyHashedData');

const requestOTPPasswordReset = async (email) => {
    try {
        if (!email) {
            throw new Error("Missing parameters for password reset.");
        }
        const matchedUser = await User.findOne({ email });
        if (!matchedUser) {
            throw new Error("No verified account with the said email exists!");
        } else {
            const emailData = await sendOTPPasswordResetEmail(matchedUser.email);
            return emailData;
        }
    } catch (error) {
        throw error;
    }
}

const sendOTPPasswordResetEmail = async (email) => {
    try {
        if (!email) {
            throw new Error("Missing parameters for password reset.");
        }
        const otp = await generateOTP();
        await PasswordResetOTP.deleteMany( {email} );
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Password Reset Request",
            html: `<p>We heard that you lost your password.</p>
            <p>This code <b>expires in 5 minutes</b>.</p>
            <p>Enter <b>${otp}</b> in the app to change your password and complete the process.`
        }
        const hashedOTP = await hashData(otp);
        const newOTPPasswordReset = await new PasswordResetOTP({
            email: email,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 5 * 60 * 1000,
            expiresAfter: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
        await newOTPPasswordReset.save();
        await sendEmail(mailOptions);
        return {
            email
        };
    } catch (error) {
        throw error;
    }
}

const verifyOTP = async (email, otp) => {
    try {
        if (!email || !otp ) {
            throw new Error("Missing parameters for password reset.");
        }
        const resetRecord = await PasswordResetOTP.find({ email });
        if (resetRecord.length <= 0) {
            throw new Error("Password Reset Request not found.");
        } else {
            const { expiresAt } = resetRecord[0];
            const hashedOTP = resetRecord[0].otp;
    
            if (expiresAt < Date.now()) {
                await PasswordResetOTP.deleteOne({ email });
                throw new Error("Password reset link has expired.");
            }
            const isOTPValid = await verifyHashedData(otp, hashedOTP);
    
            if (!isOTPValid) {
                throw new Error("Invalid code passed.");
            } else {
                await PasswordResetOTP.deleteOne({ email });
                return true;
            }  
        }
    } catch (error) {
        throw error;
    }
}

const changePassword = async (email, newPassword) => {
    try {
        if (!email || !newPassword) {
            throw new Error("Invalid parameters for password reset.");
        }
        const hashedNewPassword = await hashData(newPassword);
        await User.updateOne({ email }, { password: hashedNewPassword });
        return true;
    } catch (error) {
        throw error;
    }
}

const getTime = async (email) => {
    try {
        if (!email) {
            throw new Error("Missing email parameter");
        } else {
            const PasswordOTPVerificationRecords = await PasswordResetOTP.find({ email });
            if (PasswordOTPVerificationRecords.length <= 0) {
                throw Error(
                    "Account record doesn't exist or has been verified already."
                )
            } else {
                const { expiresAt } = PasswordOTPVerificationRecords[0];
                const currentTime = new Date();
                const remainingTime = expiresAt - currentTime;
                return remainingTime;
            }
        }
    } catch (error) {
        throw error;
    }
}
module.exports = { requestOTPPasswordReset, sendOTPPasswordResetEmail, verifyOTP, changePassword, getTime };