
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }], // Array of image URLs
    serviceCategory: { 
        type: String, 
        enum: ['massage', 'fitness', 'beauty', 'physiotherapy', 'wellness', 'other'],
        required: true 
    },
    price: { type: Number },
    location: { type: String },
    tags: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
