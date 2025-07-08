const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getChatPartner } = require('../controllers/chatController');

router.get('/:matchId', auth, getChatPartner);

module.exports = router;