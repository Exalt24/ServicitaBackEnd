const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
    reporterId: String,
    reportedId: String,
    bookingId: String,
    reason: String,
    createdAt: Date,
});

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;