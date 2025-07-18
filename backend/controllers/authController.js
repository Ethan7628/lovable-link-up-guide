
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profiles/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit (fixed from 50MB)
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
        }
    }
});

// Helper function to generate JWT
const generateToken = (user) => {
    const payload = { 
        id: user._id, 
        role: user.role,
        email: user.email
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Helper function to validate email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper function to validate phone
const isValidPhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Register user
const register = async (req, res) => {
    try {
        console.log('🔍 Registration attempt received');
        console.log('📝 Request body:', { ...req.body, password: '[HIDDEN]' });

        const { name, email, password, phone, age, bio, photos, role = 'buyer', location, gender } = req.body;

        // Enhanced validation
        if (!name || name.trim().length === 0) {
            console.log('❌ Validation failed: Missing name');
            return res.status(400).json({ 
                success: false,
                msg: 'Name is required and cannot be empty' 
            });
        }

        if (!email || email.trim().length === 0) {
            console.log('❌ Validation failed: Missing email');
            return res.status(400).json({ 
                success: false,
                msg: 'Email is required' 
            });
        }

        if (!isValidEmail(email)) {
            console.log('❌ Validation failed: Invalid email format');
            return res.status(400).json({ 
                success: false,
                msg: 'Please provide a valid email address' 
            });
        }

        if (!password || password.length < 6) {
            console.log('❌ Validation failed: Password too short');
            return res.status(400).json({ 
                success: false,
                msg: 'Password must be at least 6 characters long' 
            });
        }

        if (!phone || phone.trim().length === 0) {
            console.log('❌ Validation failed: Missing phone');
            return res.status(400).json({ 
                success: false,
                msg: 'Phone number is required' 
            });
        }

        if (!isValidPhone(phone)) {
            console.log('❌ Validation failed: Invalid phone format');
            return res.status(400).json({ 
                success: false,
                msg: 'Please provide a valid phone number' 
            });
        }

        // Check if user exists
        console.log('🔍 Checking if user exists...');
        const existingUser = await User.findOne({ 
            $or: [
                { email: email.trim().toLowerCase() },
                { phone: phone.trim() }
            ]
        });
        
        if (existingUser) {
            const field = existingUser.email === email.trim().toLowerCase() ? 'email' : 'phone number';
            console.log(`❌ User already exists with this ${field}:`, field === 'email' ? email : phone);
            return res.status(400).json({ 
                success: false,
                msg: `A user already exists with this ${field}` 
            });
        }

        // Validate role
        const validRoles = ['buyer', 'provider', 'admin'];
        if (!validRoles.includes(role)) {
            console.log('❌ Invalid role:', role);
            return res.status(400).json({ 
                success: false,
                msg: 'Invalid user role. Must be buyer, provider, or admin' 
            });
        }

        console.log('✅ Validation passed, creating user...');

        // Create user object
        const userData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password, // Will be hashed by pre-save middleware
            phone: phone.trim(),
            role,
            isActive: true,
            verificationStatus: role === 'provider' ? 'pending' : 'approved'
        };

        // Add optional fields if provided
        if (age && !isNaN(age)) userData.age = parseInt(age);
        if (bio) userData.bio = bio.trim();
        if (location) userData.location = location.trim();
        if (gender) userData.gender = gender;
        if (photos && Array.isArray(photos)) userData.photos = photos;

        const user = new User(userData);

        console.log('💾 Saving user to database...');
        await user.save();
        console.log('✅ User created successfully:', user._id);

        // Generate JWT
        const token = generateToken(user);

        console.log('🎉 Registration successful for:', email);

        // Return user data without password
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            age: user.age,
            bio: user.bio,
            location: user.location,
            gender: user.gender,
            photos: user.photos,
            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus
        };

        res.status(201).json({
            success: true,
            token,
            message: 'User registered successfully',
            user: userResponse
        });

    } catch (err) {
        console.error('💥 Registration error:', err.message);
        console.error('📍 Error stack:', err.stack);

        // Handle duplicate key errors
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            const message = field === 'email' ? 'Email address already registered' : 'Phone number already registered';
            return res.status(400).json({ 
                success: false,
                msg: message 
            });
        }

        // Handle validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ 
                success: false,
                msg: 'Validation failed',
                errors: errors
            });
        }

        res.status(500).json({
            success: false,
            msg: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        console.log('🔍 Login attempt for:', req.body.email);

        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            console.log('❌ Missing credentials');
            return res.status(400).json({ 
                success: false,
                msg: 'Please provide both email and password' 
            });
        }

        if (!isValidEmail(email)) {
            console.log('❌ Invalid email format');
            return res.status(400).json({ 
                success: false,
                msg: 'Please provide a valid email address' 
            });
        }

        // Find user
        console.log('🔍 Looking for user in database...');
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(400).json({ 
                success: false,
                msg: 'Invalid email or password' 
            });
        }

        if (!user.isActive) {
            console.log('❌ Account suspended:', email);
            return res.status(403).json({ 
                success: false,
                msg: 'Your account has been suspended. Please contact support.' 
            });
        }

        // Check password
        console.log('🔍 Verifying password...');
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log('❌ Invalid password for:', email);
            return res.status(400).json({ 
                success: false,
                msg: 'Invalid email or password' 
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        console.log('✅ Login successful for:', email);

        // Generate JWT
        const token = generateToken(user);

        // Return user data without password
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            age: user.age,
            bio: user.bio,
            location: user.location,
            gender: user.gender,
            photos: user.photos,
            profilePicture: user.profilePicture,
            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus,
            rating: user.rating,
            totalReviews: user.totalReviews
        };

        res.json({
            success: true,
            token,
            message: 'Login successful',
            user: userResponse
        });

    } catch (err) {
        console.error('💥 Login error:', err.message);
        console.error('📍 Error stack:', err.stack);
        
        res.status(500).json({
            success: false,
            msg: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        console.log('👤 Getting profile for user:', req.user.id);
        
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            console.log('❌ User not found:', req.user.id);
            return res.status(404).json({ 
                success: false,
                msg: 'User profile not found' 
            });
        }

        const userProfile = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            bio: user.bio || '',
            photos: user.photos || [],
            profilePicture: user.profilePicture,
            age: user.age,
            location: user.location,
            gender: user.gender,
            role: user.role,
            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus,
            rating: user.rating || 0,
            totalReviews: user.totalReviews || 0,
            services: user.services || [],
            earnings: user.earnings || 0,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
        };

        console.log('✅ Profile retrieved successfully');
        res.json({
            success: true,
            user: userProfile
        });

    } catch (err) {
        console.error('💥 Profile fetch error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server error fetching profile',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        console.log('✏️ Profile update request for user:', req.user.id);
        console.log('📝 Update data:', { ...req.body, password: req.body.password ? '[HIDDEN]' : undefined });

        const allowedUpdates = ['name', 'age', 'bio', 'photos', 'location', 'phone', 'services', 'gender'];
        const updateData = {};

        // Filter allowed updates
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
                updateData[key] = req.body[key];
            }
        });

        // Validate phone if being updated
        if (updateData.phone && !isValidPhone(updateData.phone)) {
            return res.status(400).json({
                success: false,
                msg: 'Please provide a valid phone number'
            });
        }

        // Only providers can update services
        if (updateData.services && req.user.role !== 'provider') {
            delete updateData.services;
        }

        // Validate age if provided
        if (updateData.age && (isNaN(updateData.age) || updateData.age < 13 || updateData.age > 120)) {
            return res.status(400).json({
                success: false,
                msg: 'Age must be a number between 13 and 120'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ 
                success: false,
                msg: 'User not found' 
            });
        }

        const userProfile = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            bio: user.bio || '',
            photos: user.photos || [],
            profilePicture: user.profilePicture,
            age: user.age,
            location: user.location,
            gender: user.gender,
            role: user.role,
            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus,
            rating: user.rating || 0,
            totalReviews: user.totalReviews || 0,
            services: user.services || [],
            earnings: user.earnings || 0
        };

        console.log('✅ Profile updated successfully');
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: userProfile
        });

    } catch (err) {
        console.error('💥 Profile update error:', err.message);
        
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({
                success: false,
                msg: `${field} is already taken by another user`
            });
        }
        
        res.status(500).json({ 
            success: false,
            msg: 'Server error updating profile',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
    try {
        console.log('📸 Profile picture upload request for user:', req.user.id);
        
        if (!req.file) {
            console.log('❌ No file uploaded');
            return res.status(400).json({ 
                success: false,
                msg: 'No image file uploaded' 
            });
        }

        console.log('📁 File details:', {
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        const profilePictureUrl = `/uploads/profiles/${req.file.filename}`;

        // Update user's profile picture in database
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePicture: profilePictureUrl },
            { new: true }
        ).select('-password');

        if (!user) {
            console.log('❌ User not found:', req.user.id);
            return res.status(404).json({ 
                success: false,
                msg: 'User not found' 
            });
        }

        console.log('✅ Profile picture uploaded successfully');
        res.json({
            success: true,
            message: 'Profile picture uploaded successfully',
            profilePictureUrl: profilePictureUrl,
            user: {
                id: user._id,
                profilePicture: user.profilePicture
            }
        });

    } catch (err) {
        console.error('💥 Profile picture upload error:', err.message);
        res.status(500).json({ 
            success: false,
            msg: 'Server error uploading profile picture',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    uploadProfilePicture,
    upload
};
