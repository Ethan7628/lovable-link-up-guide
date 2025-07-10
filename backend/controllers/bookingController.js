
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');

// Create a new booking
const createBooking = async (req, res) => {
    try {
        if (req.user.role !== 'buyer') {
            return res.status(403).json({ msg: 'Only buyers can create bookings' });
        }

        const { serviceId, bookingDate, startTime, endTime, venue, buyerPhone, notes } = req.body;

        // Verify service exists
        const service = await Service.findById(serviceId).populate('providerId');
        if (!service) {
            return res.status(404).json({ msg: 'Service not found' });
        }

        // Calculate total amount
        const totalAmount = service.price;

        const booking = new Booking({
            buyerId: req.user.id,
            providerId: service.providerId._id,
            serviceId,
            bookingDate,
            startTime,
            endTime,
            venue,
            buyerPhone,
            totalAmount,
            notes
        });

        await booking.save();
        
        // Populate the booking with service and provider details
        const populatedBooking = await Booking.findById(booking._id)
            .populate('serviceId', 'title description category')
            .populate('providerId', 'name photos phone')
            .populate('buyerId', 'name photos phone');

        res.status(201).json(populatedBooking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ buyerId: req.user.id })
            .populate('serviceId', 'title description category')
            .populate('providerId', 'name photos phone profilePicture')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get provider's bookings
const getProviderBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ providerId: req.user.id })
            .populate('serviceId', 'title description category')
            .populate('buyerId', 'name photos phone profilePicture')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update booking status (providers can accept/reject)
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Only provider can update status
        if (booking.providerId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        booking.status = status;
        await booking.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate('serviceId', 'title description category')
            .populate('buyerId', 'name photos phone profilePicture');

        res.json(populatedBooking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Cancel booking
const cancelBooking = async (req, res) => {
    try {
        const { cancellationReason } = req.body;
        
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Only buyer or provider can cancel
        if (booking.buyerId.toString() !== req.user.id && booking.providerId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        booking.status = 'cancelled';
        booking.cancellationReason = cancellationReason;
        await booking.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate('serviceId', 'title description category')
            .populate('providerId', 'name photos phone profilePicture')
            .populate('buyerId', 'name photos phone profilePicture');

        res.json(populatedBooking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    getProviderBookings,
    updateBookingStatus,
    cancelBooking
};
