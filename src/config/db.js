const mongoose = require('mongoose');
require('dotenv').config();
const Location = require('./../domains/location/model');
const { User } = require('./../domains/user/model');
const  Admin  = require('./../domains/admin/model');
const hashData = require('./../util/hashData');

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI);

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
});





