const {v4: uuidv4} = require('uuid');
const PasswordReset = require('./model');
const User = require('./../user/model');
const hashData = require('./../../util/hashData');
const verifyHashedData = require('./../../util/verifyHashedData');
const sendEmail = require('./../../util/sendEmail');

const requestPasswordReset = async (email) => {
    try {
        const matchedUsers = await User.find({ email });
        if (!matchedUsers.length) {
            throw Error("No account with the said email exists!");
        } else {
            if (!matchedUsers[0].verified) {
                throw Error ("Email hasn't been verified yet. Check your inbox.");
            } else {
                const emailData = await sendPasswordResetEmail(matchedUsers[0]);
                return emailData;
            }
        }
    } catch (error) {
        throw error;
    }
}

const sendPasswordResetEmail = async ( {_id, email }) => {
    try {
        const currentUrl = "http://localhost:5000/";
        const resetString = uuidv4() + _id;
        await PasswordReset.deleteMany( {userId: _id} );
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Reset your password",
            html: `<p>Verify your email address to complete the sign up process.</p>
            <p>This link <b>expires in 30 minues</b>.</p>
            <p>Press <a href=${currentUrl + "user/reset/" + _id + "/" + resetString}>here</a> to proceed.</p>`
        }
        // Hash the Unique String
        const hashedResetString = await hashData(resetString);
        const newPasswordReset = await new PasswordReset({
            userId: _id,
            resetString: hashedResetString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 1800000
        });
        await newPasswordReset.save();
        await sendEmail(mailOptions);
        return {
            userId: _id,
            email
        };
    } catch (error) {
        throw error;
    }
}

module.exports = { requestPasswordReset, sendPasswordResetEmail };