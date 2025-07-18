require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./App');
const http = require('http');
const setupSocket = require('./utils/socket');

const PORT = process.env.PORT || 5000;

console.log('🚀 Starting BodyConnect Backend Server...');
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔧 Port:', PORT);

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars);
    console.error('💡 Please check your .env file and ensure these variables are set:');
    missingEnvVars.forEach(envVar => {
        console.error(`   - ${envVar}`);
    });
    process.exit(1);
}

console.log('✅ All required environment variables are set');

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
setupSocket(server);

// Enhanced graceful shutdown handling
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal} signal - Closing gracefully...`);
    
    try {
        // Close server first
        server.close(() => {
            console.log('🔌 HTTP server closed');
        });
        
        // Close MongoDB connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('🗄️ MongoDB connection closed');
        }
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
        
    } catch (err) {
        console.error('❌ Error during shutdown:', err.message);
        process.exit(1);
    }
};

// Handle shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err.message);
    console.error('Stack:', err.stack);
    gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error('💥 Unhandled Promise Rejection:', err.message);
    console.error('Promise:', promise);
    gracefulShutdown('unhandledRejection');
});

// Connection event listeners
mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ Mongoose disconnected from MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err.message);
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🎉 Server running successfully!`);
    console.log(`📡 Listening on: http://0.0.0.0:${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
    
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:8080',
        'https://f6ef4dc4-d59e-4285-aeec-a87b499ae745.lovableproject.com',
        'https://bodyconnect.lovable.app'
    ];
    
    console.log('🔒 CORS allowed origins:');
    allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
    console.log('');
});

// Keep server alive settings
server.keepAliveTimeout = 60000;
server.headersTimeout = 65000;

// Prevent the process from exiting immediately
process.stdin.resume();

console.log('✅ Server initialization complete - Ready to accept connections!');
