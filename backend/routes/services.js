
const express = require('express');
const router = express.Router();
const {
    createService,
    getServices,
    getProviderServices,
    updateService,
    deleteService
} = require('../controllers/serviceController');
const auth = require('../middleware/auth');

// Create service (providers only)
router.post('/', auth, createService);

// Get all services (public)
router.get('/', getServices);

// Get provider's services
router.get('/my-services', auth, getProviderServices);

// Update service
router.put('/:id', auth, updateService);

// Delete service
router.delete('/:id', auth, deleteService);

module.exports = router;
