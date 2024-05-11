const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RatingSchema = new Schema({
    bookingId: String,
    rating: Number,
    comment: String,
    serviceId: String,
    seekerId: String,
    providerId: String,
    seekerImage: String,
    seekerName: String,
    images: [],
    createdAt: Date,
});

const Rating = mongoose.model('Rating', RatingSchema);

module.exports = Rating;