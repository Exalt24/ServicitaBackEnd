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

require('dotenv').config();

// Validation Middleware
const { validateSignupInputs } = require('../middleware/signupvalidation');
const { validateLoginInputs } = require('../middleware/loginvalidation');

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
            sendVerificationEmail(result, res);
        }).catch(err => {
            res.status(400).json({
                status: "FAILED",
                message: "An error occurred while sending the verification email!"
            })
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ status: "FAILED", message: "An error occurred." });
    }
});

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
                res.status(202).json({
                    status: "PENDING",
                    message: "Verification Email sent!"
                })
            }).catch(error => {
                console.error(error);
                res.status(400).json({
                    status: "FAILED",
                    message: "Failed to send verification email!"
                })
            });
        }).catch(error => {
            console.error(error);
            res.status(400).json({
                status: "FAILED",
                message: "An error occurred while saving verification email data!"
            })
        })
    }).catch(error => {
        console.error(error);
        res.status(400).json({
            status: "FAILED",
            message: "An error occurred while hashing email data!"
        })
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
                }).catch(err => {
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
                    res.status(400).json({ status: "FAILED", message: "Email has not been verified yet. Check your email." });
                } else {
                    const hashedPassword = data[0].password;
                    bcrypt.compare(password, hashedPassword).then(result => {
                        if (result) {
                            res.status(200).json({ status: "SUCCESS", message: "Login Successful", data: data});
                        } else {
                            res.status(400).json({ status: "FAILED", message: "Invalid Password." });
                        }
                    }).catch(err => {
                        console.error(error);
                        res.status(400).json({ status: "FAILED", message: "An error occurred while validating the password." });
                    });
                }
            }
        }).catch(error => {
            console.error(error);
            return res.status(400).json({ status: "FAILED", message: "User not found" });
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ status: "FAILED", message: "An error occurred." });
    }
});

module.exports = router;