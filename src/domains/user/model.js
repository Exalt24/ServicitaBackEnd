const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {type: String, unique: true},
    mobile: String,
    password: String,
    role: {
        type: String,
        enum: ['Seeker', 'Provider'],
    },
    verified: {
        email: {type: Boolean },
        mobile: {type: Boolean }
    },
    expiresAfter: Date,
});

const User = mongoose.model('User', UserSchema);

const TempUserDetailsSchema = new Schema({
    userId: String,
    name: String,
    address: String,
    birthDate: Date,
    expiresAfter: Date,
    service: String,
});

const TempUser = mongoose.model('TempUser', TempUserDetailsSchema);

module.exports = { User, TempUser }