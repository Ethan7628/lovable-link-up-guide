const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { likeUser, getMatches } = require('../controllers/matchController');

router.post('/like/:userId', auth, likeUser);
router.get('/', auth, getMatches);

module.exports = router;