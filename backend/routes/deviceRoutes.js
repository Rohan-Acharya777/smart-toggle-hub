
const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const auth = require('../middleware/auth');

// Get all devices
router.get('/', auth, deviceController.getDevices);

// Get device by ID
router.get('/:id', auth, deviceController.getDeviceById);

// Create device
router.post('/', auth, deviceController.createDevice);

// Update device
router.put('/:id', auth, deviceController.updateDevice);

// Delete device
router.delete('/:id', auth, deviceController.deleteDevice);

// Update device switch
router.patch('/:id/switches/:switchId', auth, deviceController.updateDeviceSwitch);

module.exports = router;
