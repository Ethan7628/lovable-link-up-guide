
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
        type: String, 
        required: true,
        enum: ['wellness', 'companionship', 'lifestyle', 'entertainment', 'fitness', 'personal-care']
    },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // in minutes
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
    location: { type: String },
    availability: [{
        day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
        startTime: { type: String },
        endTime: { type: String }
    }],
    rating: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
