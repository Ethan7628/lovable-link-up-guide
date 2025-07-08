
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createBooking,
    getUserBookings,
    getProviderBookings,
    updateBookingStatus,
    cancelBooking
} = require('../controllers/bookingController');

// Create booking (buyers only)
router.post('/', auth, createBooking);

// Get user's bookings
router.get('/my-bookings', auth, getUserBookings);

// Get provider's bookings
router.get('/provider-bookings', auth, getProviderBookings);

// Update booking status (providers only)
router.put('/:id/status', auth, updateBookingStatus);

// Cancel booking
router.put('/:id/cancel', auth, cancelBooking);

module.exports = router;
