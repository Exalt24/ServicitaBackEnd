const {v4: uuidv4} = require('uuid');
const UserVerification = require('./model');
const hashData = require("../../util/hashData");
const sendEmail = require('../../util/sendEmail');

const sendVerificationEmail = async ({ _id, email }, res) => {
    try {
        const currentUrl = "http://localhost:5000/";
        const uniqueString = uuidv4() + _id;

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify your Email Address",
            html: `<p>Verify your email address to complete the sign up process.</p>
            <p>This link <b>expires in 6 hours</b>.</p>
            <p>Press <a href=${currentUrl + "email_verification/verify/" + _id + "/" + uniqueString}>here</a> to proceed.</p>`
        }
        
        // Hash the uniqueString
        const hashedUniqueString = await hashData(uniqueString);
        
        const newVerification = await new UserVerification({
            userId: _id,
            uniqueString: hashedUniqueString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 21600000
        })

        await newVerification.save();
        await sendEmail(mailOptions);
        return {
            userId: _id,
            email
        };
    } catch (error) {
        throw error;
    }
}

module.exports = { sendVerificationEmail};