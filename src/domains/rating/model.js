const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RatingSchema = new Schema({
    bookingId: String,
    rating: Number,
    comment: String,
    createdAt: Date,
    serviceId: String,
    seekerId: String,
    providerId: String
});

const Rating = mongoose.model('Rating', RatingSchema);

module.exports = Rating;