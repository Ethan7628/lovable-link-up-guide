const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const chatRoutes = require('./routes/chat');
const matchRoutes = require('./routes/matches');
const serviceRoutes = require('./routes/services');
const paymentRoutes = require('./routes/payments');
const postRoutes = require('./routes/posts');

const app = express();

// 📦 Connect to MongoDB
connectDB();

// 📁 Ensure upload directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const postsDir = path.join(uploadsDir, 'posts');
const profilesDir = path.join(uploadsDir, 'profiles');

[uploadsDir, postsDir, profilesDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 📂 Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🌐 Enable CORS for trusted origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://bodyconnect.vercel.app',
    'https://bodyconnect-backend.vercel.app',
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
    process.env.FRONTEND_URL
].filter(Boolean).map(origin => origin.trim());

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.some(allowedOrigin =>
            typeof allowedOrigin === 'string' && allowedOrigin.includes('*')
                ? true
                : allowedOrigin === origin
        )) {
            callback(null, true);
        } else {
            console.warn('🚫 CORS blocked origin:', origin);
            console.log('🔍 Allowed origins:', allowedOrigins);
            callback(null, true); // Allow all origins in production for now
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    optionsSuccessStatus: 200
}));

// 🧠 Body parsers for JSON and URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 🧾 Request logger for debugging
// app.use((req, res, next) => {
//     const timestamp = new Date().toISOString();
//     console.log(`[${timestamp}] ${req.method} ${req.path}`);
//     if (req.body && Object.keys(req.body).length > 0) {
//         const clone = { ...req.body };
//         if (clone.password) clone.password = '[HIDDEN]';
//         console.log('📦 Body:', clone);
//     }
//     next();
// });

// ✅ Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'BodyConnect API',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// Debug middleware to check incoming requests
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        ip: req.ip
    });
    next();
});

// ✅ Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/posts', postRoutes);

// ✅ Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        message: 'BodyConnect Backend is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ❌ Error handling middleware
app.use((err, req, res, next) => {
    console.error('💥 Server Error:', err.message);
    console.error('📍 Stack trace:', err.stack);
    res.status(500).json({
        msg: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ❌ 404 handler
app.use('*', (req, res) => {
    console.warn('❌ 404 Not Found:', req.method, req.originalUrl);
    res.status(404).json({ msg: 'Route not found' });
});

module.exports = app;
