const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    key: { type: Number, unique: true },
    name: String,
});

const Service = mongoose.model('Service', ServiceSchema);

module.exports = Service;