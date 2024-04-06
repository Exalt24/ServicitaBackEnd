const express = require('express');
const router = express.Router();

const { login, findUserById, deleteUser, suspendUser, unsuspendUser, checkSuspensionStatus } = require('./controller');

router.post('/login', async (req, res) => {
    try{
        const { username, password } = req.body;
        const admin = await login(username, password);
        res.status(200).json({status: 'SUCCESS', message: 'Login successful', data: admin});
    } catch (error) {
        res.status(400).json({status: 'FAILED', message: error.message});
        console.log('Login failed');
    }
})

router.get('/getUser/:userId', async (req, res) => {
    try{
        const { userId } = req.params;
        const user = await findUserById(userId);
        res.status(200).json({status: 'SUCCESS', message: 'User fetched successfully', data: user});
    } catch (error) {
        console.log(error.message)
        res.status(400).json({status: 'FAILED', message: error.message});
    }
})

router.post('/deleteUser', async (req, res) => {
    try {
        const { userId } = req.body;
        const response = await deleteUser(userId);
        res.status(200).json({status: 'SUCCESS', message: response.message});
    } catch (error) {
        res.status(400).json({status: 'FAILED', message: error.message});
    }
})

router.patch('/suspendUser', async (req, res) => {
    try {
        const { userId, action } = req.body;
        await suspendUser(userId, action);
        res.status(200).json({status: 'SUCCESS', message: 'User suspended successfully'});
    } catch (error) {
        res.status(400).json({status: 'FAILED', message: error.message});
    }
})

router.patch('/unsuspendUser', async (req, res) => {
    try {
        const { email } = req.body;
        await unsuspendUser(email);
        res.status(200).json({status: 'SUCCESS', message: 'User unsuspended successfully'});
    } catch (error) {
        res.status(400).json({status: 'FAILED', message: error.message});
    }
})

router.get('/checkSuspensionStatus/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { type, remainingTime } = await checkSuspensionStatus(email);
        res.status(200).json({status: 'SUCCESS', message: 'User suspension status fetched successfully', type, remainingTime});
    } catch (error) {
        res.status(400).json({status: 'FAILED', message: error.message});
    }
})
    

module.exports = router;

