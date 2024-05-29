const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const { createNewUser, authenticateUser, authenticateUserWithoutPass, addTempUser, authenticateUserWithNumber, getDetails, updateDetail, getDetailsByMobile, updateTempUserNumber, getActualDetailsByMobile, updateImage, getDetailsById } = require('./controller');

router.post('/signup', async (req, res) => {
    try {
        const { email, mobile, password, role, profileImage} = req.body;
        console.log(email, mobile, password, role, profileImage)
        const newUser = await createNewUser({
            email,
            mobile,
            password,
            role,
            profileImage
        });
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
        console.error(error);
    }
});

router.post('/addTempDetails', async (req, res) => {
    try{
        const { email, mobile, password, role, name, address, birthDate, services } = req.body;
        const newTempUser = await addTempUser({ 
            email,
            mobile,
            password,
            role,
            name, 
            address, 
            birthDate,
            services
        });
        res.status(200).json({
            status: "SUCCESS",
            message: "Details Saved Successfully",
            data: newTempUser
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    
    }
})

router.post('/getTempDetails', async (req, res) => {
    try{
        const { email } = req.body;
        const { data, type } = await getDetails(email);
        res.status(200).json({
            status: "SUCCESS", 
            message: "Details Found", 
            data: data,
            type: type
        });
    }catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
        console.error(error);
    }
})

router.post('/login', async (req, res) => {
    try {
        console.log(req.body)
        const { email, password } = req.body;
        const authenticatedUser = await authenticateUser(email, password);
        const token = jwt.sign({ email: authenticatedUser.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            status: "SUCCESS",
            message: "Login Successful",
            data: token,
            userId: authenticatedUser._id,
            role: authenticatedUser.role
        })
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
        console.error(error);
    }
});


router.post('/loginOther', async (req, res) => {
    try {
        const { email } = req.body;
        const authenticatedUser = await authenticateUserWithoutPass(email);
        const token = jwt.sign({ email: authenticatedUser.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            status: "SUCCESS",
            message: "Login Successful",
            data: token,
            userId: authenticatedUser._id,
            role: authenticatedUser.role
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
        const userDetails = await authenticateUserWithNumber(mobile);
        const authenticatedUser = await authenticateUserWithoutPass(userDetails.email);
        const token = jwt.sign({ email: authenticatedUser.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            status: "SUCCESS",
            message: "Login Successful",
            data: token,
            userId: authenticatedUser._id,
            role: authenticatedUser.role
        });

    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
        console.error(error);
    }
})

router.post('/userData', async (req, res) => {
    try {
        const { token } = req.body;
        const decoded = jwt.verify(token, JWT_SECRET);
        const userEmail = decoded.email;
        const userDetails = await getDetails(userEmail);
        res.status(200).json({
            status: "SUCCESS",
            message: "User Details Found",
            data: userDetails
        });
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
})

router.post('/getUserDetailsByEmail', async (req, res) => {
    try {
        const { email } = req.body;
        const { data, type } = await getDetails(email);
        if (type === "temp") {
            res.status(200).json({
                status: "SUCCESS",
                message: "Temporary user found",
                data: data,
                type: "temp"
            });
        } else {
            res.status(200).json({
                status: "SUCCESS",
                message: "Permanent user found",
                data: data,
                type: "permanent"
            });
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
})

router.post('/getUserDetailsById', async (req, res) => {
    try {
        const { id } = req.body;
        const { data, type } = await getDetailsById(id);
        if (type === "temp") {
            res.status(200).json({
                status: "SUCCESS",
                message: "Temporary user found",
                data: data,
                type: "temp"
            });
        } else {
            res.status(200).json({
                status: "SUCCESS",
                message: "Permanent user found",
                data: data,
                type: "permanent"
            });
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
})

router.post('/getUserDetailsByMobile', async (req, res) => {
    try {
        const { mobile } = req.body;
        const { type } = await getDetailsByMobile(mobile);
        if (type === "not found") {
            res.status(200).json({
                status: "SUCCESS",
                message: "No user found with the given mobile number",
            });
        }
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
        console.log(error)
    }
})

router.post('/getActualUserDetailsByMobile', async (req, res) => {
    try {
        const { mobile } = req.body;
        const userDetails = await getActualDetailsByMobile(mobile);
        res.status(200).json({
            status: "SUCCESS",
            message: "User Details Found",
            data: userDetails
        });
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
})

router.patch('/updateDetail', async (req, res) => {
    try {
        const { userId, updateType, updateValue } = req.body;
        const updatedUser = await updateDetail(userId, updateType, updateValue);
        res.status(200).json({ status: "SUCCESS", message: "Details Updated", data: updatedUser});
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
})

router.patch('/updateTempNumber', async (req, res) => {
    try{
        const { email, mobile } = req.body;
        const updatedUser = await updateTempUserNumber(email, mobile);
        res.status(200).json({ status: "SUCCESS", message: "Mobile Number Updated", data: updatedUser});
        console.log(updatedUser)
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
})

router.patch('/updateImage', async (req, res) => {
    try {
        const { userId, url } = req.body;
        const updatedUser = await updateImage(userId, url);
        res.status(200).json({ status: "SUCCESS", message: "Details Updated", data: updatedUser});
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
})

module.exports = router;

