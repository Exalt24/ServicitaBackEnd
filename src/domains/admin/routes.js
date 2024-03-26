const express = require('express');
const router = express.Router();

const { login, findUsersByRole, findUserById, deleteUser } = require('./controller');

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

router.get('/getUsers/:role', async (req, res) => {
    try{
        const { role } = req.params;
        const users = await findUsersByRole(role);
        res.status(200).json({status: 'SUCCESS', message: 'Users fetched successfully', data: users});
    } catch (error) {
        res.status(400).json({status: 'FAILED', message: error.message});
    }
})

router.get('/getUser/:userId', async (req, res) => {
    try{
        const { userId } = req.params;
        const user = await findUserById(userId);
        res.status(200).json({status: 'SUCCESS', message: 'User fetched successfully', data: user});
    } catch (error) {
        res.status(400).json({status: 'FAILED', message: error.message});
    }
})

router.delete('/deleteUser', async (req, res) => {
    try {
        const { userId } = req.body;
        const response = await deleteUser(userId);
        res.status(200).json({status: 'SUCCESS', message: response.message});
    } catch (error) {
        res.status(400).json({status: 'FAILED', message: error.message});
    }
})

module.exports = router;

