// require('dotenv').config();
// const mongoose = require('mongoose');

// const connectDB = async () => {
//     try {
//         // Use environment variable or fallback to local MongoDB
//         const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/soulsync-dating-app';

//         console.log('🔌 Attempting to connect to MongoDB...');
//         console.log('📍 MongoDB URI:', mongoURI.includes('mongodb+srv') ? 'Cloud MongoDB Atlas' : 'Local MongoDB (127.0.0.1)');

//         // Updated connection options (remove deprecated)
//         const conn = await mongoose.connect(mongoURI, {
//             serverSelectionTimeoutMS: 5000, // 5 second timeout
//             socketTimeoutMS: 45000 // 45 second socket timeout
//         });

//         console.log(`✅ MongoDB Connected Successfully!`);
//         console.log(`🏠 Host: ${conn.connection.host}`);
//         console.log(`📚 Database: ${conn.connection.name}`);
//         console.log(`🔌 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

//         // Test the connection with a simple ping
//         await mongoose.connection.db.admin().ping();
//         console.log('🏓 MongoDB ping test successful!');

//         // Log collection info
//         const collections = await mongoose.connection.db.listCollections().toArray();
//         console.log(`📦 Available collections: ${collections.length > 0 ? collections.map(c => c.name).join(', ') : 'None (fresh database)'}`);

//     } catch (error) {
//         console.error(`💥 MongoDB Connection Error: ${error.message}`);

//         if (error.message.includes('ECONNREFUSED')) {
//             console.error('❌ MongoDB server is not running locally!');
//             console.error('📝 Please start MongoDB using one of these commands:');
//             console.error('   🪟 Windows: net start MongoDB OR mongod');
//             console.error('   🍎 Mac: brew services start mongodb-community OR mongod');
//             console.error('   🐧 Linux: sudo systemctl start mongod OR mongod');
//             console.error('💡 Tip: You can also use MongoDB Compass to start a local instance');
//         } else if (error.message.includes('authentication')) {
//             console.error('❌ MongoDB authentication failed. Check your credentials in .env file.');
//         } else if (error.message.includes('ENOTFOUND')) {
//             console.error('❌ MongoDB host not found. Using 127.0.0.1 instead of localhost.');
//         } else {
//             console.error('❌ Unexpected error:', error.stack);
//         }

//         console.error('🔧 Troubleshooting tips:');
//         console.error('   1. Ensure MongoDB is installed and running');
//         console.error('   2. Check if port 27017 is available');
//         console.error('   3. Try connecting with MongoDB Compass to test connection');
//         console.error('   4. Check firewall settings');

//         process.exit(1);
//     }
// };

// module.exports = connectDB;
// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('🔌 Attempting to connect to MongoDB...');

        // Add these mongoose connection options
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            retryWrites: true,
            w: 'majority'
        });

        console.log(`📍 MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('💥 MongoDB Connection Error:', err.message);
        console.error('🔧 Troubleshooting tips:');
        console.error('  1. Ensure MongoDB Atlas IP whitelist includes your current IP');
        console.error('  2. Verify your MONGO_URI in .env file');
        console.error('  3. Check internet connection');
        console.error('  4. Try connecting with MongoDB Compass');
        process.exit(1);
    }
};

module.exports = connectDB;