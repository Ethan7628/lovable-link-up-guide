
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createPost,
    getPosts,
    getProviderPosts,
    toggleLike,
    addComment,
    deletePost,
    upload
} = require('../controllers/postController');

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private (Providers only)
router.post('/', auth, upload.array('images', 5), createPost);

// @route   GET /api/posts
// @desc    Get all posts (feed)
// @access  Private
router.get('/', auth, getPosts);

// @route   GET /api/posts/my-posts
// @desc    Get provider's posts
// @access  Private (Providers only)
router.get('/my-posts', auth, getProviderPosts);

// @route   PUT /api/posts/:id/like
// @desc    Like/Unlike a post
// @access  Private
router.put('/:id/like', auth, toggleLike);

// @route   POST /api/posts/:id/comment
// @desc    Add comment to post
// @access  Private
router.post('/:id/comment', auth, addComment);

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, deletePost);

module.exports = router;
