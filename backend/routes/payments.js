
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createPaymentIntent,
    confirmPayment,
    getPaymentHistory
} = require('../controllers/paymentController');

// @route   POST /api/payments/create-intent
// @desc    Create payment intent
// @access  Private
router.post('/create-intent', auth, createPaymentIntent);

// @route   POST /api/payments/confirm
// @desc    Confirm payment
// @access  Private
router.post('/confirm', auth, confirmPayment);

// @route   GET /api/payments/history
// @desc    Get payment history
// @access  Private
router.get('/history', auth, getPaymentHistory);

module.exports = router;
