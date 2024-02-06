const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// mongoDB User model
const User = require('./../models/User');
const { validateSignupInputs } = require('../middleware/signupvalidation');
const { validateLoginInputs } = require('../middleware/loginvalidation');

// For Signing Up
router.post('/signup', validateSignupInputs, async (req, res) => {
    try {
        const { name, email, password, dateOfBirth } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ status: "FAILED", message: "Email is being used by another user!" });
        }

        const saltrounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltrounds);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            dateOfBirth
        });

        const result = await newUser.save();

        return res.status(200).json({ status: "SUCCESS", message: "Sign up successful", data: result });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ status: "FAILED", message: "An error occurred." });
    }
});

// For Logging In
router.post('/login', validateLoginInputs, async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({ status: "FAILED", message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
            return res.status(400).json({ status: "FAILED", message: "Invalid password" });
        }

        return res.status(200).json({ status: "SUCCESS", message: "Login successful", data: existingUser });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ status: "FAILED", message: "An error occurred." });
    }
});

module.exports = router;