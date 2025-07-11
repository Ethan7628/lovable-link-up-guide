const mongoose = require('mongoose');

// Connection state tracking
let connectionState = {
  isConnected: false,
  isConnecting: false,
  lastConnectAttempt: null,
  retryCount: 0,
  error: null
};

// Connection retry configuration
const RETRY_CONFIG = {
  maxRetries: 5,
  retryDelay: 2000, // 2 seconds
  backoffMultiplier: 1.5
};

// Health check function
const checkConnectionHealth = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      connectionState.isConnected = true;
      connectionState.error = null;
      return { healthy: true, status: 'connected' };
    } else {
      connectionState.isConnected = false;
      return { healthy: false, status: 'disconnected' };
    }
  } catch (error) {
    connectionState.isConnected = false;
    connectionState.error = error.message;
    return { healthy: false, status: 'error', error: error.message };
  }
};

// Enhanced connection function with retry logic
const connectWithRetry = async (uri, options, retryCount = 0) => {
  try {
    connectionState.isConnecting = true;
    connectionState.lastConnectAttempt = new Date();
    
    console.log(`🔌 MongoDB connection attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries + 1}`);
    
    const conn = await mongoose.connect(uri, options);
    
    connectionState.isConnected = true;
    connectionState.isConnecting = false;
    connectionState.retryCount = 0;
    connectionState.error = null;
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`🏠 Host: ${conn.connection.host}`);
    console.log(`📚 Database: ${conn.connection.name}`);
    console.log(`🔌 Connection State: Connected`);
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('🏓 MongoDB ping test successful!');
    
    // Log collection info
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📦 Available collections: ${collections.length > 0 ? collections.map(c => c.name).join(', ') : 'None (fresh database)'}`);
    
    return conn;
    
  } catch (error) {
    connectionState.isConnecting = false;
    connectionState.error = error.message;
    connectionState.retryCount = retryCount;
    
    if (retryCount < RETRY_CONFIG.maxRetries) {
      const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
      console.log(`❌ Connection failed, retrying in ${delay}ms... (${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
      console.log(`💥 Error: ${error.message}`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectWithRetry(uri, options, retryCount + 1);
    } else {
      throw error;
    }
  }
};

const connectDB = async () => {
  try {
    console.log('� Initializing MongoDB Atlas connection...');
    console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined. Please check your .env file.');
    }

    // Enhanced MongoDB Atlas connection options for cross-device compatibility
    const mongoOptions = {
      // Connection settings
      serverSelectionTimeoutMS: 30000, // 30 seconds for cold starts
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds
      
      // Connection pool settings for better performance across devices
      maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      
      // Retry and reliability settings
      retryWrites: true,
      retryReads: true,
      w: 'majority',
      
      // Authentication
      authSource: 'admin',
      
      // Network settings for cross-device compatibility
      family: 4, // Use IPv4, skip trying IPv6
      heartbeatFrequencyMS: 10000, // Check server every 10 seconds
      serverSelectionRetryDelayMS: 2000, // Retry server selection every 2 seconds
      
      // SSL/TLS settings for Atlas
      ssl: true,
      sslValidate: true,
      
      // Buffer settings
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    };

    console.log('📍 MongoDB URI configured:', process.env.MONGO_URI.includes('mongodb+srv') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB');
    console.log('⚙️ Connection options:', {
      maxPoolSize: mongoOptions.maxPoolSize,
      serverSelectionTimeout: mongoOptions.serverSelectionTimeoutMS,
      environment: process.env.NODE_ENV
    });

    const conn = await connectWithRetry(process.env.MONGO_URI, mongoOptions);
    
    // Set up connection event handlers for monitoring
    mongoose.connection.on('connected', () => {
      console.log('📡 MongoDB Atlas connected');
      connectionState.isConnected = true;
      connectionState.error = null;
    });

    mongoose.connection.on('error', (err) => {
      console.error('💥 MongoDB Atlas connection error:', err.message);
      connectionState.error = err.message;
      connectionState.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('� MongoDB Atlas disconnected');
      connectionState.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('� MongoDB Atlas reconnected');
      connectionState.isConnected = true;
      connectionState.error = null;
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      console.log('🛑 Received SIGINT, closing MongoDB connection...');
      await mongoose.connection.close();
      process.exit(0);
    });

    return conn;

  } catch (err) {
    connectionState.isConnected = false;
    connectionState.error = err.message;
    
    console.error('💥 MongoDB Connection Failed:', err.message);
    console.error('🔧 Troubleshooting Guide:');
    console.error('  1. Verify MongoDB Atlas cluster is running and accessible');
    console.error('  2. Check Network Access settings in MongoDB Atlas:');
    console.error('     - Add 0.0.0.0/0 to IP Access List for production');
    console.error('     - Or add your current IP address for development');
    console.error('  3. Verify Database Access (Database Users) in MongoDB Atlas');
    console.error('  4. Ensure MONGO_URI is correctly formatted:');
    console.error('     mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority');
    console.error('  5. Check MongoDB Atlas cluster status in the dashboard');
    console.error('  6. Verify your internet connection and firewall settings');
    
    if (err.message.includes('authentication')) {
      console.error('🔐 Authentication Error: Check username and password in MONGO_URI');
    }
    
    if (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED')) {
      console.error('🌐 Network Error: Check internet connection and MongoDB Atlas network settings');
    }
    
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    } else {
      // In production (Vercel), log error but continue to allow retries
      console.error('🚨 Production: MongoDB connection failed, service will retry...');
    }
  }
};

// Export connection state and health check for monitoring
module.exports = {
  connectDB,
  getConnectionState: () => connectionState,
  checkConnectionHealth
};