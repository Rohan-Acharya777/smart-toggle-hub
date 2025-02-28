
const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const auth = require('../middleware/auth');

// Get device history
router.get('/devices/:deviceId', auth, historyController.getDeviceHistory);

// Get device stats
router.get('/devices/:deviceId/stats', auth, historyController.getDeviceStats);

module.exports = router;
