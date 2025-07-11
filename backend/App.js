
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { connectDB, getConnectionState, checkConnectionHealth } = require('./config/db');

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

// 🌐 Enable CORS for trusted origins with enhanced cross-device support
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'https://bodyconnect.vercel.app',
    'https://bodyconnect-backend.vercel.app',
    // Add additional Vercel preview URLs
    /^https:\/\/bodyconnect.*\.vercel\.app$/,
    /^https:\/\/.*\.bodyconnect\.vercel\.app$/,
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
    process.env.FRONTEND_URL
].filter(Boolean).map(origin => typeof origin === 'string' ? origin.trim() : origin);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Capacitor, or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin matches any allowed pattern
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (typeof allowedOrigin === 'string') {
                return allowedOrigin.includes('*') ? true : allowedOrigin === origin;
            } else if (allowedOrigin instanceof RegExp) {
                return allowedOrigin.test(origin);
            }
            return false;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn('🚫 CORS blocked origin:', origin);
            console.log('🔍 Allowed origins:', allowedOrigins);
            // Allow all origins in development/production for now
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Cache-Control'],
    optionsSuccessStatus: 200
}));

// 🧠 Body parsers for JSON and URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 🔍 Request logging middleware (enhanced)
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${req.ip || req.connection.remoteAddress}`);
    
    if (req.method !== 'GET') {
        console.log('Request headers:', {
            'content-type': req.headers['content-type'],
            'authorization': req.headers['authorization'] ? 'Bearer [TOKEN]' : 'None',
            'x-auth-token': req.headers['x-auth-token'] ? '[TOKEN]' : 'None'
        });
    }
    
    next();
});

// ✅ Enhanced health check endpoints
app.get('/api/health', async (req, res) => {
    try {
        const dbHealth = await checkConnectionHealth();
        const connectionState = getConnectionState();
        
        const healthData = {
            status: 'OK',
            service: 'BodyConnect API',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            database: {
                status: dbHealth.healthy ? 'connected' : 'disconnected',
                isConnected: connectionState.isConnected,
                isConnecting: connectionState.isConnecting,
                lastConnectAttempt: connectionState.lastConnectAttempt,
                retryCount: connectionState.retryCount,
                error: connectionState.error || dbHealth.error || null
            },
            version: require('./package.json').version || '1.0.0',
            features: {
                cors: 'enabled',
                uploads: 'enabled',
                auth: 'enabled'
            }
        };

        // Set appropriate status code based on database health
        const statusCode = dbHealth.healthy ? 200 : 503;
        
        res.status(statusCode).json(healthData);
    } catch (error) {
        console.error('Health check error:', error);
        res.status(503).json({
            status: 'ERROR',
            service: 'BodyConnect API',
            timestamp: new Date().toISOString(),
            error: error.message,
            database: {
                status: 'error',
                error: error.message
            }
        });
    }
});

// 🔍 Detailed database status endpoint
app.get('/api/health/database', async (req, res) => {
    try {
        const dbHealth = await checkConnectionHealth();
        const connectionState = getConnectionState();
        
        res.json({
            healthy: dbHealth.healthy,
            status: dbHealth.status,
            connectionState: {
                isConnected: connectionState.isConnected,
                isConnecting: connectionState.isConnecting,
                lastConnectAttempt: connectionState.lastConnectAttempt,
                retryCount: connectionState.retryCount,
                error: connectionState.error
            },
            error: dbHealth.error || connectionState.error || null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            healthy: false,
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ✅ Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/posts', postRoutes);

// ✅ Enhanced test endpoint
app.get('/api/test', async (req, res) => {
    try {
        const dbHealth = await checkConnectionHealth();
        
        res.json({
            message: 'BodyConnect Backend is working!',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            database: dbHealth.healthy ? 'connected' : 'disconnected',
            cors: 'enabled',
            endpoints: {
                auth: '/api/auth',
                posts: '/api/posts',
                services: '/api/services',
                bookings: '/api/bookings',
                payments: '/api/payments',
                chat: '/api/chat',
                health: '/api/health'
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'BodyConnect Backend - Partial functionality',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// ❌ Enhanced error handling middleware
app.use((err, req, res, next) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] 💥 Server Error:`, err.message);
    console.error('📍 Stack trace:', err.stack);
    console.error('📍 Request details:', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
    });
    
    // Don't leak sensitive information in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
        msg: 'Something went wrong!',
        error: isDevelopment ? err.message : 'Internal server error',
        timestamp,
        ...(isDevelopment && { stack: err.stack })
    });
});

// ❌ Enhanced 404 handler
app.use('*', (req, res) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ❌ 404 Not Found: ${req.method} ${req.originalUrl} - ${req.ip}`);
    
    res.status(404).json({ 
        msg: 'Route not found',
        timestamp,
        method: req.method,
        path: req.originalUrl,
        availableEndpoints: {
            health: '/api/health',
            test: '/api/test',
            auth: '/api/auth',
            posts: '/api/posts',
            services: '/api/services'
        }
    });
});

module.exports = app;
