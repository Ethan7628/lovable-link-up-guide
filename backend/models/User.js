
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['buyer', 'provider', 'admin'], 
        default: 'buyer',
        required: true 
    },
    age: { type: Number },
    gender: { type: String },
    bio: { type: String },
    location: { type: String },
    photos: [{ type: String }],
    
    // Provider-specific fields
    services: [{
        category: { type: String },
        title: { type: String },
        description: { type: String },
        price: { type: Number },
        duration: { type: Number }, // in minutes
        availability: [{
            day: { type: String },
            startTime: { type: String },
            endTime: { type: String }
        }]
    }],
    isVerified: { type: Boolean, default: false },
    verificationStatus: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    
    // Admin fields
    adminLevel: { type: String, enum: ['super', 'moderator'], default: 'moderator' },
    
    // Common fields
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    
    // Original dating app fields (keeping for backward compatibility)
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', userSchema);
