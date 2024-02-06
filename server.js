// To Access MongoDB
require('./config/db');

const app = require('express')();
const port = process.env.port || 3000;

const UserRouter = require('./api/User');

// Accepting post form Data
const bodyParser = require('express').json;
app.use(bodyParser());

app.use('/user', UserRouter);

app.listen(port, () => {
    console.log(`Connected on ${port}`)
})