const path = require('path');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const {v4: uuidv4} = require('uuid');

// mongoDB User model
const User = require('./../models/User');
// mongoDB User Verification model
const UserVerification = require('./../models/UserVerification');
// mongoDB Password Reset model
const PasswordReset = require('./../models/PasswordReset');
// mongodb OTP Verification model
const UserOTPVerification = require('../models/UserOTPVerification');

require('dotenv').config();

// Validation Middleware
const { validateSignupInputs } = require('../middleware/signupvalidation');
const { validateLoginInputs } = require('../middleware/loginvalidation');

const { error } = require('console');


let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})

transporter.verify((error, success) => {
    if(error){
        console.error(error);
    } else {
        console.log("Ready for messages");
        console.log(success);
    }
})

// For Signing Up
router.post('/signup', validateSignupInputs, async (req, res) => {
    try {
        const { name, email, password, dateOfBirth } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ status: "FAILED", message: "Email is being used by another user!" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            dateOfBirth,
            verified: false
        });

        newUser.save().then(result => {
            // sendVerificationEmail(result, res);
            sendOTPVerificationEmail(result, res);
        }).catch(error => {
            console.error(error);
            return res.status(400).json({ status: "FAILED", message: "An error occurred while sending the verification email!" });
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ status: "FAILED", message: "An error occurred." });
    }
});

const sendOTPVerificationEmail = async ({ _id, email }, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify your Email Address",
            html: `<p>Verify your email address to complete the sign up process.</p>
            <p>This code <b>expires in 30 minutes</b>.</p>
            <p>Enter <b>${otp}</b> in the app to verify your email address and complete the process.`
        }

        // Hash the OTP
        const saltRounds = 10;

        const hashedOTP = await bcrypt.hash(otp, saltRounds);
        const newOTPVerification = await new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 1800000
        });
        await newOTPVerification.save();
        await transporter.sendMail(mailOptions);
        return res.status(202).json({ status: "PENDING", message: "Verification OTP Email sent.", data: {
            userId: _id,
            email
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ status: "FAILED", message: "An error occurred while sending the email." });
    }
};

router.post("/verifyOTP", async (req, res) => {
    try {
        let { userId, otp } = req.body;
        if (!userId || !otp) {
            throw Error("Empty OTP details are not allowed");
        } else {
            const UserOTPVerificationRecords = await UserOTPVerification.find({
                userId,
            });
            if (UserOTPVerificationRecords.length <= 0) {
                throw new Error(
                    "Account record doesn't exist or has been verified already."
                );
            } else {
                const { expiresAt } = UserOTPVerificationRecords[0];
                const hashedOTP = UserOTPVerificationRecords[0].otp;

                if (expiresAt < Date.now()) {
                    await UserOTPVerification.deleteMany({ userId });
                    throw new Error("Code has expired. Please request again.");
                } else {
                    const validOTP = await bcrypt.compare(otp, hashedOTP);
                    if (!validOTP) {
                        throw new Error("Invalid code passed.")
                    } else {
                        await User.updateOne({ _id: userId }, {verified: true });
                        await UserOTPVerification.deleteMany({ userId });
                        return res.status(200).json({ status: "SUCCESS", message: "Email verified successfully." });
                    }
                }
            }
        }   
    } catch (error) {
        return res.status(400).json({ status: "FAILED", message: error.message});
    }
});

router.post("/resendOTPVerificationCode", async (req, res) => {
    try {
        let { userId, email } = req.body;
        if ( !userId || !email ) {
            throw Error("Empty user details are not allowed");
        } else {
            await UserOTPVerification.deleteMany({ userId });
            sendOTPVerificationEmail({ _id: userId, email }, res);
        }
    } catch (error) {
        return res.status(400).json({ status: "FAILED", message: error.message });
    }
})

const sendVerificationEmail = ({_id, email}, res) => {
    // URL to use for the email
    const currentUrl = "http://localhost:5000/";
    
    const uniqueString = uuidv4() + _id;

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify your Email Address",
        html: `<p>Verify your email address to complete the sign up process.</p>
        <p>This link <b>expires in 6 hours</b>.</p>
        <p>Press <a href=${currentUrl + "user/verify/" + _id + "/" + uniqueString}>here</a> to proceed.</p>`
    }
    
    // Hash the uniqueString
    const saltRounds = 10;
    bcrypt.hash(uniqueString, saltRounds).then(hashedUniqueString => {
        // Set values in userVerification Collection
        const newVerification = new UserVerification({
            userId: _id,
            uniqueString: hashedUniqueString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 21600000
        })
        newVerification.save().then(() => {
            transporter.sendMail(mailOptions).then(() => {
                return res.status(202).json({ status: "PENDING", message: "Verification Email sent!" });
            }).catch(error => {
                console.error(error);
                return res.status(400).json({ status: "FAILED", message: "Failed to send verification email!" });
            });
        }).catch(error => {
            console.error(error);
            return res.status(400).json({ status: "FAILED", message: "An error occurred while saving verification email data!" });
        })
    }).catch(error => {
        console.error(error);
        return res.status(400).json({ status: "FAILED", message: "An error occurred while hashing email data!" });
    })
}

// For Verifying Email
router.get('/verify/:userId/:uniqueString', (req, res) => {
    let { userId, uniqueString } = req.params;
    UserVerification.find({userId}).then(result => {
        if (result.length > 0){
            const {expiresAt} = result[0];
            const hashedUniqueString = result[0].uniqueString;
            // Expired Record
            if (expiresAt < Date.now()){
                UserVerification.deleteOne({userId}).then(result => {
                    User.deleteOne({_id: userId}).then(result => {
                        let message = "The link has expired. Please sign up again";
                        res.redirect(`/user/verified/error=true&message=${message}`)
                    }).catch(error => {
                        console.error(error);
                        let message = "Clearing user with expired unique string failed.";
                        res.redirect(`/user/verified/error=true&message=${message}`)
                    });
                }).catch(error => {
                    console.error(error);
                    let message = "An error occured while deleting expired user verification record.";
                    res.redirect(`/user/verified/error=true&message=${message}`)
                });
            } // Valid Record 
            else {
                bcrypt.compare(uniqueString, hashedUniqueString).then(result => {
                    if (result) {
                        // Strings match
                        User.updateOne({_id: userId}, {verified: true}).then(() => {
                            UserVerification.deleteOne({userId}).then(() => {
                                res.sendFile(path.join(__dirname, "./../views/verified.html"));
                            }).catch(error => {
                                console.error(error);
                                let message = "An error occured while finalizing verification.";
                                res.redirect(`/user/verified/error=true&message=${message}`)
                            });
                        }).catch(error => {
                            console.error(error);
                            let message = "An error occured while updating verification status.";
                            res.redirect(`/user/verified/error=true&message=${message}`)
                        });
                    } else {
                        // Record exists but incorrect verification detailes passed
                        let message = "Invalid verification details passed. Check your inbox.";
                        res.redirect(`/user/verified/error=true&message=${message}`)
                    }
                }).catch(error => {
                    console.error(error);
                    let message = "An error occured while comparing unique strings.";
                    res.redirect(`/user/verified/error=true&message=${message}`)
                });
            }
        } else {
            let message = "Account record doesn't exist or has already been verified.";
            res.redirect(`/user/verified/error=true&message=${message}`)
        }
    }).catch(error => {
        console.error(error);
        let message = "An error occured while checking for existing user verification record.";
        res.redirect(`/user/verified/error=true&message=${message}`);
    });
})

// Route for Verified Page
router.get("/verified", (req, res) => {
    res.sendFile(path.join(_dirname, "./../views/verified.html"))
})

// For Logging In
router.post('/login', validateLoginInputs, async (req, res) => {
    try {
        const { email, password } = req.body;

        User.find({ email }).then(data => {
            if (data.length) {
                if (!data[0].verified) {
                    return res.status(400).json({ status: "FAILED", message: "Email has not been verified yet. Check your email." });
                } else {
                    const hashedPassword = data[0].password;
                    bcrypt.compare(password, hashedPassword).then(result => {
                        if (result) {
                            return res.status(200).json({ status: "SUCCESS", message: "Login Successful", data: data});
                        } else {
                            return res.status(400).json({ status: "FAILED", message: "Invalid Password." });
                        }
                    }).catch(error => {
                        console.error(error);
                        return res.status(400).json({ status: "FAILED", message: "An error occurred while validating the password." });
                    });
                }
            } else {
                return res.status(400).json({ status: "FAILED", message: "User not found!" });
            }
        }).catch(error => {
            console.error(error);
            return res.status(400).json({ status: "FAILED", message: "An error occurred while finding the user" });
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ status: "FAILED", message: "An error occurred." });
    }
});

// For Requesting Password Reset
router.post("/requestPasswordReset", (req, res) => {

    const { email, redirectUrl } = req.body;

    User.find({ email }).then(data => {
        if (data.length) {
            if (!data[0].verified) {
                res.status(400).json({ status: "FAILED", message: "Email has not been verified yet. Check your email." });
            } else {
                sendResetEmail(data[0], redirectUrl, res);
            }
        } else {
            return res.status(400).json({ status: "FAILED", message: "User not found!" });
        }
    }).catch(error => {
        console.error(error);
        return res.status(400).json({ status: "FAILED", message: "An error occurred." });
    });
});

// Send Password Reset Email
const sendResetEmail = ({_id, email}, redirectUrl, res) => {
    const resetString = uuidv4() + _id;

    PasswordReset.deleteMany({userId: _id}).then(result => {
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Password Reset",
            html: `<p>How could you lose the password, you dumb fuck.</p>
            <p>Use the link below and do not forget it again.</p>
            <p>This link <b>expires in 30 minutes</b>.</p>
            <p>Press <a href=${redirectUrl + "/" + _id + "/" + resetString}>here</a> to proceed.</p>`
        };

        // Hash the reset string
        const saltRounds = 10;
        bcrypt.hash(resetString, saltRounds).then(hasehedResetString => {
            // Set values in Password Reset Collection
            const newPasswordReset = new PasswordReset({
                userId: _id,
                resetString: hasehedResetString,
                createdAt: Date.now(),
                expiresAt: Date.now() + 1800000
            })
            newPasswordReset.save().then(() => {
                transporter.sendMail(mailOptions).then((result) => {
                    return res.status(202).json({ status: "PENDING", message: "Password Reset Email sent!" });
                }).catch(error => {
                    console.error(error);
                    return res.status(400).json({ status: "FAILED", message: "Failed to send email." });
                });
            }).catch(error => {
                console.error(error);
                return res.status(400).json({ status: "FAILED", message: "Failed to save password reset data" });
            });
        }).catch(error => {
            console.error(error);
            return res.status(400).json({ status: "FAILED", message: "An error occurred while hashing password reset data!" });
        });

    }).catch(error => {
        console.error(error);
        return res.status(400).json({ status: "FAILED", message: "An error occurred while clearing existing password reset records."});
    });
}

// For Actual Password Reset
router.post("/resetPassword", (req, res) => {
    let { userId, resetString, newPassword } = req.body;

    PasswordReset.find({userId}).then(result => {
        if (result.length > 0) {
            const {expiresAt} = result[0];
            const hashedResetString = result[0].resetString;
            if (expiresAt < Date.now()) {
                PasswordReset.deleteOne({userId}).then(result => {
                    return res.status(400).json({ status: "FAILED", message: "Password reset link has expired." });
                }).catch(error => {
                    console.error(error);
                    return res.status(400).json({ status: "FAILED", message: "An error occurred while deleting existing reset record." });
                });
            } else {
                bcrypt.compare(resetString, hashedResetString).then(result => {
                    if (result) {
                        const saltRounds = 10;
                        bcrypt.hash(newPassword, saltRounds).then(hashedNewPassword => {
                            // Update User Password
                            User.updateOne({_id: userId}, {password: hashedNewPassword}).then(() => {
                                PasswordReset.deleteOne({userId}).then(() => {
                                    return res.status(200).json({ status: "SUCCESS", message: "Password Reset Success!" });
                                }).catch(error => {
                                    console.error(error);
                                    return res.status(400).json({ status: "FAILED", message: "An error occurred while finalizing password reset." });
                                });
                            }).catch(error => {
                                console.error(error);
                                return res.status(400).json({ status: "FAILED", message: "An error occurred while updating user password." });
                            });
                        }).catch(error => {
                            console.error(error);
                            return res.status(400).json({ status: "FAILED", message: "An error occurred while hashing new password." });
                        });
                    } else {
                        return res.status(400).json({ status: "FAILED", message: "Invalid password reset details passed." });
                    }
                }).catch(error => {
                    console.error(error);
                    return res.status(400).json({ status: "FAILED", message: "An error has occurred while comparing password reset strings." });
                });
            }
        } else {
            return res.status(400).json({ status: "FAILED", message: "Password Reset Request not found." });
        }
    }).catch(error => {
        console.error(error);
        return res.status(400).json({ status: "FAILED", message: "An error occurred while checking for existing password reset record." });
    });
})

module.exports = router;