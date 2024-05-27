const express = require('express');
const router = express.Router();

const { createReport, getReports, deleteReport, getReportByBookingId, updateReport } = require('./controller');

router.post('/createReport', async (req, res) => {
    try {
        const { reporterId, reportedId, reason, bookingId, status } = req.body;
        const newReport = await createReport(reporterId, reportedId, reason, bookingId, status);
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

router.put('/updateReport/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const record = await updateReport(id, status)

        if (!record) {
            return res.status(404).send('Record not found');
        }

        res.send(record);
    } catch (error) {
        return res.status(404).json({error: error.message});
    }
})



module.exports = router;