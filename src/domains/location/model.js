const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    key: { type: Number, unique: true },
    name: String,
    barangays: [String],
});

const Location = mongoose.model('Location', LocationSchema);

module.exports = Location;