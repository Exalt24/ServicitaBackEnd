const Rating = require('./model');

const createRating = async (bookingId, rating, comment, serviceId, seekerId, providerId, images, seekerImage, seekerName) => {
    try {
        const newRating = await Rating.create({
            bookingId,
            rating,
            comment,
            serviceId,
            seekerId,
            providerId,
            images,
            seekerImage,
            seekerName,
            createdAt: new Date(),
        });
        return newRating;
    } catch (error) {
        throw error;
    }
}

const getRatingsByUser = async (userId) => {
    try {
        const ratings = await Rating.find({ providerId: userId });
        return ratings;
    } catch (error) {
        throw error;
    }
}

const getRatingsByService = async (serviceId) => {
    try {
        const ratings = await Rating.find({ serviceId });
        return ratings;
    } catch (error) {
        throw error;
    
    }
}

const getRatingByBooking = async (bookingId) => {
    try {
        const rating = await Rating.findOne({ bookingId });
        if (!rating) {
            return false;
        }
        return true
    }
    catch (error) {
        throw error;
    }
}



module.exports = { createRating, getRatingsByUser, getRatingsByService, getRatingByBooking };