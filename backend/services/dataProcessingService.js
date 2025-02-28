
const History = require('../models/History');
const logger = require('../utils/logger');

class DataProcessingService {
  /**
   * Calculate power consumption over a period
   * @param {string} deviceId - The device ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<{ energy: number, cost: number, avgPower: number }>}
   */
  async calculatePowerConsumption(deviceId, startDate, endDate, kwhPrice = 0.15) {
    try {
      // Get history data
      const history = await History.find({
        deviceId,
        timestamp: { $gte: startDate, $lte: endDate }
      }).sort({ timestamp: 1 });
      
      if (history.length === 0) {
        return { energy: 0, cost: 0, avgPower: 0 };
      }
      
      // Calculate time difference in hours
      const timeDiffHours = (endDate - startDate) / (1000 * 60 * 60);
      
      // Calculate average power
      let totalPower = 0;
      
      for (const record of history) {
        totalPower += record.current * record.voltage;
      }
      
      const avgPower = totalPower / history.length;
      
      // Calculate energy in kWh
      const energy = avgPower * timeDiffHours / 1000;
      
      // Calculate cost
      const cost = energy * kwhPrice;
      
      return {
        energy: parseFloat(energy.toFixed(3)),
        cost: parseFloat(cost.toFixed(2)),
        avgPower: parseFloat(avgPower.toFixed(2))
      };
    } catch (error) {
      logger.error(`Error calculating power consumption: ${error.message}`);
      return { energy: 0, cost: 0, avgPower: 0 };
    }
  }
  
  /**
   * Get peak power times
   * @param {string} deviceId - The device ID
   * @param {string} period - 'day', 'week', or 'month'
   * @returns {Promise<Array<{ hour: number, power: number }>>}
   */
  async getPeakPowerTimes(deviceId, period = 'day') {
    try {
      // Calculate date range
      const endDate = new Date();
      let startDate = new Date();
      let groupBy = { hour: { $hour: '$timestamp' } };
      
      switch (period) {
        case 'day':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          groupBy = { 
            day: { $dayOfWeek: '$timestamp' },
            hour: { $hour: '$timestamp' }
          };
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          groupBy = { day: { $dayOfMonth: '$timestamp' } };
          break;
        default:
          startDate.setHours(startDate.getHours() - 24);
      }
      
      // Aggregate data
      const peakData = await History.aggregate([
        {
          $match: {
            deviceId: deviceId,
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $addFields: {
            power: { $multiply: ['$current', '$voltage'] }
          }
        },
        {
          $group: {
            _id: groupBy,
            avgPower: { $avg: '$power' },
            maxPower: { $max: '$power' }
          }
        },
        {
          $sort: { avgPower: -1 }
        },
        {
          $limit: 5
        }
      ]);
      
      return peakData.map(item => ({
        timeBlock: item._id,
        avgPower: parseFloat(item.avgPower.toFixed(2)),
        maxPower: parseFloat(item.maxPower.toFixed(2))
      }));
    } catch (error) {
      logger.error(`Error getting peak power times: ${error.message}`);
      return [];
    }
  }
}

module.exports = new DataProcessingService();
