
const History = require('../models/History');
const Device = require('../models/Device');
const logger = require('../utils/logger');
const { formatResponse } = require('../utils/responseFormatter');

// Get device history with time range
const getDeviceHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { timeRange = 'day', limit = 100 } = req.query;
    
    // Check if device exists
    const device = await Device.findById(deviceId);
    
    if (!device) {
      return res.status(404).json(formatResponse(null, false, 'Device not found'));
    }
    
    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'day':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setHours(startDate.getHours() - 24);
    }
    
    // Get history data
    const history = await History.find({
      deviceId,
      timestamp: { $gte: startDate, $lte: endDate }
    })
    .sort({ timestamp: 1 })
    .limit(parseInt(limit));
    
    res.status(200).json(formatResponse(history));
  } catch (error) {
    logger.error(`Error fetching device history: ${error.message}`);
    res.status(500).json(formatResponse(null, false, 'Server error'));
  }
};

// Get aggregated statistics
const getDeviceStats = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { timeRange = 'day' } = req.query;
    
    // Check if device exists
    const device = await Device.findById(deviceId);
    
    if (!device) {
      return res.status(404).json(formatResponse(null, false, 'Device not found'));
    }
    
    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'day':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setHours(startDate.getHours() - 24);
    }
    
    // Aggregate data
    const stats = await History.aggregate([
      {
        $match: {
          deviceId: device._id,
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          avgCurrent: { $avg: '$current' },
          avgVoltage: { $avg: '$voltage' },
          maxCurrent: { $max: '$current' },
          maxVoltage: { $max: '$voltage' },
          avgPower: { $avg: { $multiply: ['$current', '$voltage'] } },
          maxPower: { $max: { $multiply: ['$current', '$voltage'] } },
          totalReadings: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json(formatResponse(stats[0] || {}));
  } catch (error) {
    logger.error(`Error fetching device stats: ${error.message}`);
    res.status(500).json(formatResponse(null, false, 'Server error'));
  }
};

module.exports = {
  getDeviceHistory,
  getDeviceStats
};
