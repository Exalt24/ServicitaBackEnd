const PasswordResetOTP = require('./model');
const { User, TempUser } = require('./../user/model');
const hashData = require('./../../util/hashData');
const sendEmail = require('./../../util/sendEmail');
const generateOTP = require('./../../util/generateOTP');

const requestOTPPasswordReset = async (email) => {
    try {
        const matchedUsers = await User.find({ email });
        if (!matchedUsers.length) {
            throw Error("No account with the said email exists!");
        } else {
            if (!matchedUsers[0].verified) {
                throw Error ("Email hasn't been verified yet. Check your inbox.");
            } else {
                const emailData = await sendOTPPasswordResetEmail(matchedUsers[0]);
                return emailData;
            }
        }
    } catch (error) {
        throw error;
    }
}

const sendOTPPasswordResetEmail = async ( {_id, email }) => {
    try {
        const otp = await generateOTP();
        await PasswordResetOTP.deleteMany( {userId: _id} );
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
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 5 * 60 * 1000,
            expiresAfter: new Date(Date.now() + 5 * 60 * 1000)
        });
        await newOTPPasswordReset.save();
        await sendEmail(mailOptions);
        return {
            userId: _id,
            email
        };
    } catch (error) {
        throw error;
    }
}

module.exports = { requestOTPPasswordReset, sendOTPPasswordResetEmail };