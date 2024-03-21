const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const { createNewUser, authenticateUser, authenticateUserWithoutPass, addTempUser } = require('./controller');
const { sendOTPVerificationEmail } = require('./../email_verification_otp/controller')
const { User, TempUser } = require('./model');
const UserOTPVerification = require('./../email_verification_otp/model');

router.post('/signup', async (req, res) => {
    try {
        const { email, mobile, password, role } = req.body;
        const newUser = await createNewUser({
            email,
            mobile,
            password,
            role
        });
        const emailData = await sendOTPVerificationEmail(newUser);
        res.status(202).json({
            status: "PENDING",
            message: "Verification Email Sent",
            data: emailData
        });
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
});

router.post('/addTempDetails', async (req, res) => {
    try{
        const { userId, name, address, birthDate, service } = req.body;
        const newTempUser = await addTempUser({ 
            userId, 
            name, 
            address, 
            birthDate,
            service
        });
        res.status(200).json({
            status: "SUCCESS",
            message: "Details Saved Successfully",
            data: newTempUser
        });
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    
    }
})

router.post('/getTempDetails', async (req, res) => {
    try{
        const { userId } = req.body;
        TempUser.findOne({ userId: userId }).then(data => {
            res.status(200).json({
                status: "SUCCESS",
                message: "Details Found",
                data: data
            })
        })
    }catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
})

router.post('/signupOther', async (req, res) => {
    try {
        const { email, mobile, password, role } = req.body;
        const newUser = await createNewUser({
            email,
            mobile,
            password,
            role,
            verified: { email: true, mobile: false }
        });
        await User.updateOne({ email }, { $unset: { expiresAfter: 1 } });
        res.status(200).json({
            status: "SUCCESS",
            message: "Details Saved Successfully",
            data: newUser
        });
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const authenticatedUser = await authenticateUser(email, password);
        const token = jwt.sign({ email: authenticatedUser[0].email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            status: "SUCCESS",
            message: "Login Successful",
            data: token
        })
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
});


router.post('/loginOther', async (req, res) => {
    try {
        const { email } = req.body;
        const authenticatedUser = await authenticateUserWithoutPass(email);
        const token = jwt.sign({ email: authenticatedUser[0].email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            status: "SUCCESS",
            message: "Login Successful",
            data: token
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
});

router.post('/loginUsingMobile', async (req, res) => {
    try {
        const { mobile } = req.body;
        const userDetails = User.findOne({ mobile: mobile });
        console.log(userDetails)
        const authenticatedUser = await authenticateUserWithoutPass(userDetails.email);
        console.log(authenticatedUser)
        const token = jwt.sign({ email: authenticatedUser[0].email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            status: "SUCCESS",
            message: "Login Successful",
            data: token
        })
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
})

router.post('/userdata', async (req, res) => {
    
    try {
        const { token } = req.body;
        const decoded = jwt.verify(token, JWT_SECRET);
        const userEmail = decoded.email;
        User.findOne({ email: userEmail }).then(data => {
            res.status(200).json({
                status: "SUCCESS",
                message: "Token Verified",
                data: data
        })
        });
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
        console.log(error)
    }
})
router.post('/getuserid', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email });
        if (user) {
            res.status(200).json({
                status: "SUCCESS",
                message: "User Found",
                data: user
            });
        } else {
            res.status(404).json({
                status: "FAILED",
                message: "User not found"
            });
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            status: "FAILED",
            message: "Internal server error"
        });
    }
});


// router.post('/updatedata', async (req, res) => {
//     try {
//         const { userId, name } = req.body;
//         User.findOneAndUpdate({ _id: userId }, { name: name }).then(data => {
//             res.status(200).json({
//                 status: "SUCCESS",
//                 message: "Data Updated",
//                 data: data
//         })
//         });
//     } catch (error) {
//         res.status(400).json({
//             status: "FAILED",
//             message: error.message
//         });
//         console.log(error)
//     } 
// })

router.post('/updateemail', async (req, res) => {
    try {
        const { userId, email, otp } = req.body;
        const existingUser = await User.findOne({ email: email });
        if (userId === existingUser._id && existingUser.verified.email) {
            throw new Error("User already has this email");
        } else if (existingUser && existingUser.verified.email) {
            throw new Error("Email is being used by another user.");
        } else {
            await sendOTPVerificationEmail({ _id: userId, email });
            const UserOTPVerificationRecords = await UserOTPVerification.find({ userId });
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
                    const validOTP = await verifyHashedData(otp, hashedOTP);
                    if (!validOTP) {
                        throw new Error("Invalid code passed.")
                    } else {
                        await User.updateOne({ _id: userId }, { email: email });
                        await UserOTPVerification.deleteMany({ userId });
                        res.status(200).json({ status: "SUCCESS", message: "Email Updated"});
                    }
                }
            }
        }
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
        console.log(error)
    }
})

router.post('/updatepassword', async (req, res) => {
    try {
        const { userId, password } = req.body;
        const hashedPassword = await hashData(password);
        await User.updateOne({ _id: userId }, { password: hashedPassword });
        res.status(200).json({ status: "SUCCESS", message: "Password Updated"});
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
        console.log(error)
    }
})
    
router.post('/getMobile', async (req, res) => {
    try {
        const { mobile } = req.body;
        const existingNumber = await User.findOne({ mobile: mobile });
        if (!existingNumber) {
            throw new Error("Mobile number not found");
        } else {
            res.status(200).json({ status: "SUCCESS", message: "Mobile number found", data: existingNumber });
        }
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
        console.log(error)
    }
})

router.post('/verifyMobile', async (req, res) => {
    try {
        const { userId, mobile } = req.body;
        await User.updateOne({ _id: userId, mobile: mobile }, {  $set: { "verified.mobile": true } });
        await User.updateMany({ mobile: mobile, _id: { $ne: userId } }, { $set: { mobile: "" } });
        res.status(200).json({ status: "SUCCESS", message: "Mobile number verified"});
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
        console.log(error)
    }
})

router.post('/checkIfEmailExists', async (req, res) => {
    try {
        const { email } = req.body;
        const existingEmail = await User.findOne ({ email: email });
        if (!existingEmail) {
            throw new Error("Email does not exist");
        } else if (existingEmail.verified.email){
            res.status(200).json({ status: "SUCCESS", message: "Email exists", data: existingEmail });
        }
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
        console.log(error)
    }
})

module.exports = router;

