
const Device = require('../models/Device');
const mqttService = require('../services/mqttService');
const logger = require('../utils/logger');
const { formatResponse } = require('../utils/responseFormatter');

// Get all devices
const getDevices = async (req, res) => {
  try {
    const devices = await Device.find({});
    res.status(200).json(formatResponse(devices));
  } catch (error) {
    logger.error(`Error fetching devices: ${error.message}`);
    res.status(500).json(formatResponse(null, false, 'Server error'));
  }
};

// Get a device by ID
const getDeviceById = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json(formatResponse(null, false, 'Device not found'));
    }
    
    res.status(200).json(formatResponse(device));
  } catch (error) {
    logger.error(`Error fetching device: ${error.message}`);
    res.status(500).json(formatResponse(null, false, 'Server error'));
  }
};

// Create a new device
const createDevice = async (req, res) => {
  try {
    const newDevice = new Device(req.body);
    const savedDevice = await newDevice.save();
    
    // Subscribe to device topics
    const topicPrefix = savedDevice.mqttConfig?.topicPrefix || `devices/${savedDevice._id}`;
    await mqttService.subscribeToDevice(savedDevice._id.toString(), topicPrefix);
    
    res.status(201).json(formatResponse(savedDevice));
  } catch (error) {
    logger.error(`Error creating device: ${error.message}`);
    res.status(500).json(formatResponse(null, false, 'Server error'));
  }
};

// Update a device
const updateDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json(formatResponse(null, false, 'Device not found'));
    }
    
    // Update device
    const updatedDevice = await Device.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // If MQTT config changed, update subscriptions
    if (req.body.mqttConfig) {
      const oldTopicPrefix = device.mqttConfig?.topicPrefix;
      const newTopicPrefix = updatedDevice.mqttConfig?.topicPrefix;
      
      if (oldTopicPrefix !== newTopicPrefix) {
        await mqttService.updateDeviceSubscription(
          updatedDevice._id.toString(),
          oldTopicPrefix,
          newTopicPrefix
        );
      }
    }
    
    res.status(200).json(formatResponse(updatedDevice));
  } catch (error) {
    logger.error(`Error updating device: ${error.message}`);
    res.status(500).json(formatResponse(null, false, 'Server error'));
  }
};

// Delete a device
const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json(formatResponse(null, false, 'Device not found'));
    }
    
    // Unsubscribe from device topics
    const topicPrefix = device.mqttConfig?.topicPrefix || `devices/${device._id}`;
    await mqttService.unsubscribeFromDevice(device._id.toString(), topicPrefix);
    
    // Delete device
    await Device.findByIdAndDelete(req.params.id);
    
    res.status(200).json(formatResponse({ message: 'Device deleted successfully' }));
  } catch (error) {
    logger.error(`Error deleting device: ${error.message}`);
    res.status(500).json(formatResponse(null, false, 'Server error'));
  }
};

// Update a specific switch on a device
const updateDeviceSwitch = async (req, res) => {
  try {
    const { id, switchId } = req.params;
    const { state } = req.body;
    
    const device = await Device.findById(id);
    
    if (!device) {
      return res.status(404).json(formatResponse(null, false, 'Device not found'));
    }
    
    // Find the switch
    const switchIndex = device.switches.findIndex(s => s.id === switchId);
    
    if (switchIndex === -1) {
      return res.status(404).json(formatResponse(null, false, 'Switch not found'));
    }
    
    // Update switch state in DB
    device.switches[switchIndex].state = state;
    await device.save();
    
    // Publish switch state to MQTT
    const topicPrefix = device.mqttConfig?.topicPrefix || `devices/${device._id}`;
    const topic = `${topicPrefix}/switches/${switchId}`;
    await mqttService.publishMessage(topic, { state });
    
    res.status(200).json(formatResponse(device));
  } catch (error) {
    logger.error(`Error updating switch: ${error.message}`);
    res.status(500).json(formatResponse(null, false, 'Server error'));
  }
};

module.exports = {
  getDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  updateDeviceSwitch
};
