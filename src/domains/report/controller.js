const Report = require('./model');

const createReport = async (reporterId, reportedId, reason, bookingId) => {
    try {
        const newReport = new Report({
            reporterId,
            reportedId,
            reason,
            bookingId,
            createdAt: new Date(),
        });
        return await newReport.save();
    } catch (error) {
        throw error;
    }
}

const getReports = async () => {
    try {
        return await Report.find();
    } catch (error) {
        throw error;
    }
}

const deleteReport = async (reportId) => {
    try {
        return await Report.findByIdAndDelete(reportId);
    } catch (error) {
        throw error;
    }
}

const getReportByBookingId = async (bookingId, reporterId) => {
    try {
        const report = await Report.findOne({ bookingId, reporterId });
        if (!report) {
            return false;
        }
        return true;
    }
    catch (error) {
        throw error;
    }
}


module.exports = { createReport, getReports, deleteReport, getReportByBookingId };