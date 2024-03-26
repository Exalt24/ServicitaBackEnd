// To Access MongoDB
require('./config/db');

const app = require('express')();
const bodyParser = require('express').json;
const routes = require('./routes');
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,
   optionSuccessStatus:200,
}

app.use(cors(corsOptions))
// const CustomError = require('./util/CustomError');
// const globalErrorHandler = require('./domains/errorController');




// Accepting Post Form Data
app.use(bodyParser());
// Registering Routes
app.use(routes);
// Error Handling
// app.all('*', (req, res, next) => {
//     const err = new CustomError(`Can't find ${req.originalUrl} on this server!`, 404);
//     next(err);
// });
// app.use(globalErrorHandler);

module.exports = app;