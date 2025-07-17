const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
// ... other route imports ...

const app = express();

// Connect to MongoDB
connectDB();

// Enhanced CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'https://bodyconnect.lovable.app',
    // Add other domains as needed
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); // Allow mobile/curl requests
        if (allowedOrigins.includes(origin) ||
            origin.startsWith('http://localhost') ||
            origin.startsWith('https://localhost')) {
            return callback(null, true);
        }
        console.warn(`⚠️  CORS blocked: ${origin}`);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
// ... other routes ...

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`💥 Error: ${err.message}`);
    res.status(500).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

module.exports = app;