const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register user
const register = async (req, res) => {
    try {
        console.log('🔍 Registration attempt received');
        console.log('📝 Request body:', { ...req.body, password: '[HIDDEN]' });
        
        const { name, email, password, phone, age, bio, photos, role = 'buyer', location } = req.body;

        // Enhanced validation
        if (!name || name.trim().length === 0) {
            console.log('❌ Validation failed: Missing name');
            return res.status(400).json({ msg: 'Name is required' });
        }

        if (!email || email.trim().length === 0) {
            console.log('❌ Validation failed: Missing email');
            return res.status(400).json({ msg: 'Email is required' });
        }

        if (!password || password.length < 6) {
            console.log('❌ Validation failed: Password too short');
            return res.status(400).json({ msg: 'Password must be at least 6 characters' });
        }

        if (!phone || phone.trim().length === 0) {
            console.log('❌ Validation failed: Missing phone');
            return res.status(400).json({ msg: 'Phone number is required' });
        }

        // Check if user exists
        console.log('🔍 Checking if user exists...');
        let user = await User.findOne({ email: email.trim().toLowerCase() });
        if (user) {
            console.log('❌ User already exists:', email);
            return res.status(400).json({ msg: 'User already exists with this email' });
        }

        // Validate role
        if (!['buyer', 'provider', 'admin'].includes(role)) {
            console.log('❌ Invalid role:', role);
            return res.status(400).json({ msg: 'Invalid user role' });
        }

        console.log('✅ Validation passed, creating user...');

        // Create user
        user = new User({ 
            name: name.trim(), 
            email: email.trim().toLowerCase(), 
            password: password, // Will be hashed by pre-save middleware
            phone: phone.trim(), 
            age: age ? parseInt(age) : undefined, 
            bio: bio || '', 
            photos: photos || [],
            role,
            location: location || '',
            verificationStatus: role === 'provider' ? 'pending' : 'approved'
        });

        console.log('💾 Saving user to database...');
        await user.save();
        console.log('✅ User created successfully:', user._id);

        // Generate JWT
        const payload = { id: user._id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        console.log('🎉 Registration successful for:', email);

        res.status(201).json({ 
            token,
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('💥 Registration error:', err.message);
        console.error('📍 Error stack:', err.stack);
        
        if (err.code === 11000) {
            // Duplicate key error
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ msg: `${field} already exists` });
        }
        
        res.status(500).json({ 
            msg: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        console.log('🔍 Login attempt for:', req.body.email);
        
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('❌ Missing credentials');
            return res.status(400).json({ msg: 'Please provide email and password' });
        }

        // Find user
        console.log('🔍 Looking for user in database...');
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        if (!user.isActive) {
            console.log('❌ Account suspended:', email);
            return res.status(400).json({ msg: 'Account is suspended' });
        }

        // Check password
        console.log('🔍 Verifying password...');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('❌ Invalid password for:', email);
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        console.log('✅ Login successful for:', email);

        // Generate JWT
        const payload = { id: user._id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ 
            token,
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('💥 Login error:', err.message);
        console.error('📍 Error stack:', err.stack);
        res.status(500).json({ 
            msg: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        const userProfile = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            about: user.bio || '',
            photos: user.photos || [],
            age: user.age,
            location: user.location,
            role: user.role,
            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus,
            rating: user.rating,
            totalReviews: user.totalReviews,
            services: user.services || [],
            earnings: user.earnings || 0
        };
        
        res.json(userProfile);
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ msg: 'Server error fetching profile' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        console.log('Profile update request:', req.body);
        
        const { name, age, bio, photos, location, phone, services } = req.body;
        
        const updateData = { name, age, bio, photos, location, phone };
        
        // Only providers can update services
        if (req.user.role === 'provider' && services) {
            updateData.services = services;
        }
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const userProfile = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            about: user.bio || '',
            photos: user.photos || [],
            age: user.age,
            location: user.location,
            role: user.role,
            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus,
            rating: user.rating,
            totalReviews: user.totalReviews,
            services: user.services || [],
            earnings: user.earnings || 0
        };
        
        res.json(userProfile);
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ msg: 'Server error updating profile' });
    }
};

module.exports = { register, login, getProfile, updateProfile };
