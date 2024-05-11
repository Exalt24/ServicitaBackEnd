const express = require('express');
const router = express.Router();

const { createReport, getReports, deleteReport, getReportByBookingId } = require('./controller');

router.post('/createReport', async (req, res) => {
    try {
        const { reporterId, reportedId, reason, bookingId } = req.body;
        const newReport = await createReport(reporterId, reportedId, reason, bookingId);
        res.status(201).json(newReport);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.get('/getReports', async (req, res) => {
    try {
        const reports = await getReports();
        res.status(200).json(reports);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.delete('/deleteReport/:reportId', async (req, res) => {
    try {
        const { reportId } = req.params;
        const deletedReport = await deleteReport(reportId);
        res.status(200).json(deletedReport);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

router.post('/getReportByBookingId', async (req, res) => {
    try {
        const { bookingId, reporterId } = req.body;
        const report = await getReportByBookingId(bookingId, reporterId);
        res.status(200).json(report);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})



module.exports = router;