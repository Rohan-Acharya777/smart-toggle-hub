
const Device = require('../models/Device');
const History = require('../models/History');
const mqttService = require('./mqttService');
const logger = require('../utils/logger');

class DeviceService {
  /**
   * Check if a device is online by sending a ping
   * @param {string} deviceId - The device ID
   * @returns {Promise<boolean>} - True if device responds within timeout
   */
  async pingDevice(deviceId) {
    try {
      const device = await Device.findById(deviceId);
      
      if (!device) {
        logger.warn(`Attempted to ping unknown device: ${deviceId}`);
        return false;
      }
      
      const topicPrefix = device.mqttConfig?.topicPrefix || `devices/${device._id}`;
      const pingTopic = `${topicPrefix}/ping`;
      const responseTopic = `${topicPrefix}/pong`;
      
      // Create a promise that resolves on pong or times out
      const pingPromise = new Promise((resolve) => {
        // Set up a one-time subscription for the response
        const messageHandler = (message) => {
          resolve(true);
        };
        
        // Subscribe to response topic
        mqttService.client.once(responseTopic, messageHandler);
        
        // Publish ping
        mqttService.publishMessage(pingTopic, { timestamp: new Date().toISOString() });
        
        // Set timeout
        setTimeout(() => {
          mqttService.client.removeListener(responseTopic, messageHandler);
          resolve(false);
        }, 5000); // 5 second timeout
      });
      
      // Wait for ping result
      const isOnline = await pingPromise;
      
      // Update device status
      await Device.findByIdAndUpdate(deviceId, {
        isOnline,
        ...(isOnline ? { lastUpdate: new Date() } : {})
      });
      
      return isOnline;
    } catch (error) {
      logger.error(`Error pinging device: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Clean up historical data based on retention policy
   * @returns {Promise<number>} - Number of records deleted
   */
  async cleanupHistoricalData() {
    try {
      // Get all devices
      const devices = await Device.find({});
      let totalDeleted = 0;
      
      // Process each device
      for (const device of devices) {
        if (!device.mongoConfig?.retentionDays) continue;
        
        const retentionDays = device.mongoConfig.retentionDays;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        
        // Delete old records
        const result = await History.deleteMany({
          deviceId: device._id,
          timestamp: { $lt: cutoffDate }
        });
        
        totalDeleted += result.deletedCount;
        logger.info(`Cleaned up ${result.deletedCount} historical records for device ${device._id}`);
      }
      
      return totalDeleted;
    } catch (error) {
      logger.error(`Error cleaning up historical data: ${error.message}`);
      return 0;
    }
  }
  
  /**
   * Check all devices online status
   * @returns {Promise<{ online: number, offline: number, total: number }>}
   */
  async checkAllDevicesStatus() {
    try {
      const devices = await Device.find({});
      let online = 0;
      let offline = 0;
      
      for (const device of devices) {
        const isOnline = await this.pingDevice(device._id);
        isOnline ? online++ : offline++;
      }
      
      return { online, offline, total: devices.length };
    } catch (error) {
      logger.error(`Error checking devices status: ${error.message}`);
      return { online: 0, offline: 0, total: 0 };
    }
  }
}

module.exports = new DeviceService();
