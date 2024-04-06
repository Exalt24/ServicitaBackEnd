const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {type: String, unique: true},
    mobile: {type: String, unique: true},
    password: String,
    role: {
        type: String,
        enum: ['Seeker', 'Provider'],
    },
    profileImage: String,
    suspension: {
        isSuspended: Boolean,
        expiresAt: Date,
    },
});

const User = mongoose.model('User', UserSchema);

const TempUserDetailsSchema = new Schema({
    email: {type: String, unique: true},
    mobile: {type: String, unique: true},
    password: String,
    role: {
        type: String,
        enum: ['Seeker', 'Provider'],
    },
    name: {
        firstName: String,
        lastName: String
    },
    address: {
        streetAddress1: String,
        streetAddress2: String,
        cityMunicipality: String,
        barangay: String
    },
    birthDate: Date,
    services: [{
        serviceId: { type: String, unique: true },
        serviceType: String,
        name: String,
        description: String,
        price: {
            min: Number,
            max: Number,
        },
        availability: [{
            day: String,
            startTime: String,
            endTime: String,
            flagAvailable: Boolean
        }]
    }],
    expiresAfter: Date,
});

const TempUser = mongoose.model('TempUser', TempUserDetailsSchema);

module.exports = { User, TempUser }