
const Post = require('../models/Post');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/posts/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Create a new post
const createPost = async (req, res) => {
    try {
        if (req.user.role !== 'provider') {
            return res.status(403).json({ msg: 'Access denied. Providers only.' });
        }

        const { title, description, serviceCategory, price, location, tags } = req.body;
        
        const images = req.files ? req.files.map(file => `/uploads/posts/${file.filename}`) : [];

        const post = new Post({
            providerId: req.user.id,
            title,
            description,
            serviceCategory,
            price,
            location,
            tags: tags ? tags.split(',') : [],
            images
        });

        await post.save();
        await post.populate('providerId', 'name photos rating totalReviews location isVerified');
        
        res.status(201).json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get all posts (feed)
const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, location } = req.query;
        
        let filter = { isActive: true };
        if (category) filter.serviceCategory = category;
        if (location) filter.location = new RegExp(location, 'i');

        const posts = await Post.find(filter)
            .populate('providerId', 'name photos rating totalReviews location isVerified')
            .populate('comments.userId', 'name photos')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get posts by provider
const getProviderPosts = async (req, res) => {
    try {
        const posts = await Post.find({ 
            providerId: req.user.id,
            isActive: true 
        })
        .populate('providerId', 'name photos rating totalReviews location isVerified')
        .sort({ createdAt: -1 });

        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Like/Unlike a post
const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const userIndex = post.likes.indexOf(req.user.id);
        if (userIndex > -1) {
            post.likes.splice(userIndex, 1);
        } else {
            post.likes.push(req.user.id);
        }

        await post.save();
        res.json({ likes: post.likes.length, isLiked: userIndex === -1 });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Add comment to post
const addComment = async (req, res) => {
    try {
        const { comment } = req.body;
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        post.comments.push({
            userId: req.user.id,
            comment
        });

        await post.save();
        await post.populate('comments.userId', 'name photos');
        
        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Delete post
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        if (post.providerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Post deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    createPost,
    getPosts,
    getProviderPosts,
    toggleLike,
    addComment,
    deletePost,
    upload
};
