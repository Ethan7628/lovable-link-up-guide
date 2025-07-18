
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

// Connect to MongoDB first
connectDB();

// CORS Configuration - Comprehensive setup
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'https://f6ef4dc4-d59e-4285-aeec-a87b499ae745.lovableproject.com',
    'https://bodyconnect.lovable.app',
    'https://bodyconnect-backend.vercel.app'
];

// Enhanced CORS middleware
app.use(cors({
    origin: function (origin, callback) {
        console.log('🌐 Request origin:', origin || 'no-origin');

        // Allow requests with no origin (Postman, mobile apps, etc.)
        if (!origin) {
            console.log('✅ No origin - allowing request');
            return callback(null, true);
        }

        // Check exact matches first
        if (allowedOrigins.includes(origin)) {
            console.log('✅ Origin allowed:', origin);
            return callback(null, true);
        }

        // Check pattern matches
        if (origin.includes('lovableproject.com') ||
            origin.includes('lovable.app') ||
            origin.startsWith('http://localhost') ||
            origin.startsWith('https://localhost')) {
            console.log('✅ Pattern match allowed:', origin);
            return callback(null, true);
        }

        console.log('⚠️ Origin not in whitelist:', origin);
        console.log('📋 Allowed origins:', allowedOrigins);

        // For development, allow all origins temporarily
        if (process.env.NODE_ENV !== 'production') {
            console.log('🔧 Development mode - allowing origin');
            return callback(null, true);
        }

        return callback(null, true); // Allow for now to prevent blocking
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-auth-token',
        'Cache-Control',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Origin',
        'Accept',
        'X-Requested-With'
    ],
    exposedHeaders: ['x-auth-token'],
    optionsSuccessStatus: 200
}));

// Pre-flight OPTIONS handler
app.options('*', (req, res) => {
    console.log('🔄 Handling OPTIONS request for:', req.path);
    res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, Cache-Control');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

// Body parsing middleware
app.use(express.json({
    limit: '50mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            console.error('❌ Invalid JSON in request body');
            res.status(400).json({ error: 'Invalid JSON format' });
            throw new Error('Invalid JSON');
        }
    }
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const origin = req.get('Origin') || 'no-origin';
    const userAgent = req.get('User-Agent') || 'unknown';

    console.log(`📊 [${timestamp}] ${req.method} ${req.path}`);
    console.log(`   Origin: ${origin}`);
    console.log(`   User-Agent: ${userAgent.substring(0, 50)}...`);

    // Log request body for POST/PUT requests (exclude sensitive data)
    if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
        const logBody = { ...req.body };
        if (logBody.password) logBody.password = '[HIDDEN]';
        console.log(`   Body:`, JSON.stringify(logBody).substring(0, 200));
    }

    next();
});

// Health check endpoint with detailed info
app.get('/api/health', (req, res) => {
    console.log('🏥 Health check requested');

    const { getConnectionState } = require('./config/db');
    const dbState = getConnectionState();
    const healthData = {
        status: dbState.isConnected ? 'OK' : 'ERROR',
        service: 'BodyConnect Backend',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        database: {
            status: dbState.isConnected ? 'connected' : 'disconnected',
            isConnected: dbState.isConnected,
            error: dbState.error || null,
            host: 'MongoDB Atlas'
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cors: {
            allowedOrigins: allowedOrigins,
            requestOrigin: req.get('Origin') || 'none'
        }
    };
    res.status(200).json(healthData);
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
    console.log('🧪 Test endpoint hit');
    res.json({
        message: 'Backend is working!',
        timestamp: new Date().toISOString(),
        origin: req.get('Origin')
    });
});

// API Routes with error handling
try {
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
} catch (error) {
    console.error('❌ Error loading auth routes:', error.message);
}

try {
    app.use('/api/posts', postsRoutes);
    console.log('✅ Posts routes loaded');
} catch (error) {
    console.error('❌ Error loading posts routes:', error.message);
}

try {
    app.use('/api/services', servicesRoutes);
    console.log('✅ Services routes loaded');
} catch (error) {
    console.error('❌ Error loading services routes:', error.message);
}

try {
    app.use('/api/bookings', bookingsRoutes);
    console.log('✅ Bookings routes loaded');
} catch (error) {
    console.error('❌ Error loading bookings routes:', error.message);
}

try {
    app.use('/api/payments', paymentsRoutes);
    console.log('✅ Payments routes loaded');
} catch (error) {
    console.error('❌ Error loading payments routes:', error.message);
}

try {
    app.use('/api/matches', matchesRoutes);
    console.log('✅ Matches routes loaded');
} catch (error) {
    console.error('❌ Error loading matches routes:', error.message);
}

try {
    app.use('/api/chat', chatRoutes);
    console.log('✅ Chat routes loaded');
} catch (error) {
    console.error('❌ Error loading chat routes:', error.message);
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
}

// Create subdirectories
['posts', 'profiles'].forEach(dir => {
    const subDir = path.join(uploadsDir, dir);
    if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
        console.log(`📁 Created ${dir} directory`);
    }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('💥 Global error handler triggered:');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Request URL:', req.url);
    console.error('Request method:', req.method);
    console.error('Request headers:', req.headers);

    // Don't send stack trace in production
    const errorResponse = {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString(),
        path: req.path
    };

    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }

    res.status(500).json(errorResponse);
});

// 404 handler - must be last
app.use('*', (req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

module.exports = app;
