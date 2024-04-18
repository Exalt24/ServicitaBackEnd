const Rating = require('./model');

const createRating = async (reviewId, bookingId, rating, comment, serviceId, seekerId, providerId) => {
    try {

        const newRating = await Rating.create({
            reviewId,
            bookingId,
            rating,
            comment,
            createdAt: new Date(),
            serviceId,
            seekerId,
            providerId
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



module.exports = { createRating, getRatingsByUser, getRatingsByService };