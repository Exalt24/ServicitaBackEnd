const express = require('express');
const router = express.Router();

const { addNewService, deleteService, getServices } = require('./controller');


router.post('/addService', async (req, res) => {
    try{
        const { service } = req.body;
        const newService = await addNewService({
            service
        });
        res.status(200).json({status: 'SUCCESS', message: 'Service Added Successfully', data: newService});
    } catch (error) {
        res.status(400).json({status: 'FAILED', message: error.message});
    }
})

router.post('/deleteService', async (req, res) => {
    try{
        const { service } = req.body;
        const deletedService = await deleteService({
            service
        });
        res.status(200).json({status: 'SUCCESS', message: 'Service Deleted Successfully', data: deletedService});
    } catch (error) {
        res.status(400).json({status: 'FAILED', message: error.message});
    }
})

router.get('/getServices', async (req, res) => {
    try {
        const services = await getServices();
        res.status(200).json({status: 'SUCCESS', data: services});
    } catch (error) {
        res.status(400).json({status: 'FAILED', message: error.message});
    }
})

module.exports = router;

