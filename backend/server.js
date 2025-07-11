// require('dotenv').config();
// const app = require('./App');
// const http = require('http');
// const setupSocket = require('./utils/socket');

// const PORT = process.env.PORT || 5000;

// const server = http.createServer(app);
// setupSocket(server);

// server.listen(PORT, () =>
//     console.log(`Server running on port ${PORT}`)
// );

// server.js
require('dotenv').config();
const mongoose = require('mongoose'); // Add this line
const app = require('./App');
const http = require('http');
const setupSocket = require('./utils/socket');

const PORT = process.env.PORT || 5000;

// Optional: Add mongoose connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

const server = http.createServer(app);
setupSocket(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`CORS allowed origins: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});
