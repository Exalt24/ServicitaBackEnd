// To Access MongoDB
require('./config/db');

const app = require('express')();
const bodyParser = require('express').json;
const routes = require('./routes');

// Accepting Post Form Data
app.use(bodyParser());
// Registering Routes
app.use(routes);

module.exports = app;