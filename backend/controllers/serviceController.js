
const Service = require('../models/Service');
const User = require('../models/User');

// Create a new service (providers only)
const createService = async (req, res) => {
    try {
        if (req.user.role !== 'provider') {
            return res.status(403).json({ msg: 'Access denied. Providers only.' });
        }

        const { title, description, category, price, duration, images, tags, location, availability } = req.body;

        const service = new Service({
            providerId: req.user.id,
            title,
            description,
            category,
            price,
            duration,
            images: images || [],
            tags: tags || [],
            location,
            availability: availability || []
        });

        await service.save();
        res.status(201).json(service);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get all services (with filters)
const getServices = async (req, res) => {
    try {
        const { category, location, minPrice, maxPrice, search } = req.query;
        
        let filter = { isActive: true };
        
        if (category) filter.category = category;
        if (location) filter.location = new RegExp(location, 'i');
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { tags: new RegExp(search, 'i') }
            ];
        }

        const services = await Service.find(filter)
            .populate('providerId', 'name photos rating totalReviews location isVerified')
            .sort({ createdAt: -1 });

        res.json(services);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get services by provider
const getProviderServices = async (req, res) => {
    try {
        const services = await Service.find({ providerId: req.user.id })
            .sort({ createdAt: -1 });

        res.json(services);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update service
const updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ msg: 'Service not found' });
        }

        if (service.providerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedService);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Delete service
const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ msg: 'Service not found' });
        }

        if (service.providerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        await Service.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Service deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    createService,
    getServices,
    getProviderServices,
    updateService,
    deleteService
};
