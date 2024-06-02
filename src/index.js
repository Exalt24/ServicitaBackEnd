const server = require('./server');

const port = process.env.PORT || 5001;


const startServer = () => {
    server.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });

    server.get('/', (req, res) => {
        res.send('Yawa Ka World');
    });
};

startServer();
