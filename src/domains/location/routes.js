const express = require('express');
const router = express.Router();

const { addNewCity, deleteCity, getCities } = require('./controller');


router.post('/addCity', async (req, res) => {
    try{
        const { location } = req.body;
        const newLocation = await addNewCity({
            location
        });
        res.status(200).json({status: 'SUCCESS', message: 'City Added Successfully', data: newLocation});
    } catch (error) {
        res.status(400).json({status: 'FAILED', message: error.message});
    }
})

router.post('/deleteCity', async (req, res) => {
    try{
        const { location } = req.body;
        const deletedLocation = await deleteCity({
            location
        });
        res.status(200).json({status: 'SUCCESS', message: 'City Deleted Successfully', data: deletedLocation});
    } catch (error) {
        res.status(400).json({status: 'FAILED', message: error.message});
    }
})

router.get('/getCities', async (req, res) => {
    try {
        const cities = await getCities();
        res.status(200).json({status: 'SUCCESS', data: cities});
    } catch (error) {
        res.status(400).json({status: 'FAILED', message: error.message});
    }
})

module.exports = router;

