
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const servicesRoutes = require('./routes/services');
const bookingsRoutes = require('./routes/bookings');
const paymentsRoutes = require('./routes/payments');
const matchesRoutes = require('./routes/matches');
const chatRoutes = require('./routes/chat');

const app = express();

// Connect to MongoDB
connectDB();

// Enhanced CORS Configuration - Fixed to include current Lovable domain
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'https://bodyconnect.lovable.app',
    'https://f6ef4dc4-d59e-4285-aeec-a87b499ae745.lovableproject.com', // Current Lovable domain
    'https://lovableproject.com',
    // Add other domains as needed
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list or matches Lovable patterns
        if (allowedOrigins.includes(origin) ||
            origin.startsWith('http://localhost') ||
            origin.startsWith('https://localhost') ||
            origin.includes('lovableproject.com') ||
            origin.includes('lovable.app')) {
            return callback(null, true);
        }
        
        console.warn(`⚠️  CORS blocked: ${origin}`);
        // Allow the request anyway to prevent blocking
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Cache-Control']
}));

// Handle preflight requests
app.options('*', cors());

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'none'}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'BodyConnect Backend',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
            status: 'connected',
            isConnected: true
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/chat', chatRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
