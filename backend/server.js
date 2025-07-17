require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./App');
const http = require('http');
const setupSocket = require('./utils/socket');

const PORT = process.env.PORT || 5000;

// Improved server shutdown handling
const gracefulShutdown = async () => {
    console.log('\n🛑 Received shutdown signal - Closing gracefully...');
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
};

// Handle shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Prevent immediate shutdown
process.stdin.resume();

const server = http.createServer(app);
setupSocket(server);

// Connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Allowed CORS origins:', [
        'http://localhost:5173',
        'http://localhost:8080',
        'https://bodyconnect.lovable.app'
    ].join(', '));
});

// Keep the server alive
server.keepAliveTimeout = 60000;