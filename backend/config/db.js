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
  initialRetryDelay: 2000,
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
    }
    connectionState.isConnected = false;
    return { healthy: false, status: 'disconnected' };
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
      const delay = RETRY_CONFIG.initialRetryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
      console.log(`❌ Connection failed, retrying in ${delay}ms... (${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
      console.log(`💥 ${error.message}`);

      await new Promise(resolve => setTimeout(resolve, delay));
      return connectWithRetry(uri, options, retryCount + 1);
    }
    throw error;
  }
};

const connectDB = async () => {
  try {
    console.log('🔄 Initializing MongoDB connection...');
    console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    // MongoDB connection options optimized for Atlas
    const mongoOptions = {
      // Timeout settings
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,

      // Connection pool settings
      maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,

      // Retry settings
      retryWrites: true,
      retryReads: true,
      w: 'majority',

      // Other settings
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false
    };

    console.log('📍 MongoDB URI configured:', process.env.MONGO_URI.includes('mongodb+srv') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB');
    console.log('⚙️ Connection options:', {
      maxPoolSize: mongoOptions.maxPoolSize,
      serverSelectionTimeoutMS: mongoOptions.serverSelectionTimeoutMS,
      environment: process.env.NODE_ENV || 'development'
    });

    const conn = await connectWithRetry(process.env.MONGO_URI, mongoOptions);

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to DB');
      connectionState.isConnected = true;
      connectionState.error = null;
    });

    mongoose.connection.on('error', (err) => {
      console.error('💥 MongoDB connection error:', err.message);
      connectionState.error = err.message;
      connectionState.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📡 Mongoose disconnected');
      connectionState.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('📡 Mongoose reconnected');
      connectionState.isConnected = true;
      connectionState.error = null;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('🛑 Closing MongoDB connection...');
      await mongoose.connection.close();
      process.exit(0);
    });

    return conn;
  } catch (err) {
    connectionState.isConnected = false;
    connectionState.error = err.message;

    console.error('💥 MongoDB Connection Failed:', err.message);
    console.error('🔧 Troubleshooting Guide:');
    console.error('  1. Verify MongoDB Atlas cluster is running');
    console.error('  2. Check Network Access settings (whitelist your IP)');
    console.error('  3. Verify Database Access credentials');
    console.error('  4. Check MONGO_URI format');

    if (process.env.NODE_ENV !== 'production') {
      console.error('🛑 Exiting due to connection failure...');
      process.exit(1);
    }

    throw err;
  }
};

module.exports = {
  connectDB,
  getConnectionState: () => connectionState,
  checkConnectionHealth
};
