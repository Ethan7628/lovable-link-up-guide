const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes (only once)
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const chatRoutes = require('./routes/chat');
const matchRoutes = require('./routes/matches');
const serviceRoutes = require('./routes/services');

const app = express();

// Connect to database
connectDB();

// Enable CORS for all routes with enhanced configuration for local development
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
            'http://localhost:4173', // Vite preview
            'http://127.0.0.1:4173',
            process.env.CORS_ORIGIN,
            process.env.FRONTEND_URL
        ].filter(Boolean);

        // In development, be more permissive
        if (process.env.NODE_ENV === 'development') {
            console.log('🌐 CORS request from:', origin);
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('⚠️  CORS origin not allowed:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-auth-token',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Body parser middleware with better limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add request logging with better formatting
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
        const logBody = { ...req.body };
        if (logBody.password) logBody.password = '[HIDDEN]';
        console.log('📦 Body:', logBody);
    }
    next();
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Mount all routes (only once)
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/services', serviceRoutes);

// Test route
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Backend is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('💥 Server Error:', err.message);
    console.error('📍 Stack trace:', err.stack);
    console.error('🔍 Request details:', {
        method: req.method,
        url: req.url,
        body: req.body,
        headers: req.headers
    });

    res.status(500).json({
        msg: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use('*', (req, res) => {
    console.log('❌ 404 Not Found:', req.method, req.originalUrl);
    res.status(404).json({ msg: 'Route not found' });
});

module.exports = app;
