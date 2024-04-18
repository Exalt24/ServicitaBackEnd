const mongoose = require('mongoose');
require('dotenv').config();
const { initiatePayment } = require('../domains/payment/controller');
const Report = require('../domains/report/model');

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI);

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
});




