
const mqtt = require('mqtt');
const mqttConfig = require('../config/mqtt');
const Device = require('../models/Device');
const History = require('../models/History');
const logger = require('../utils/logger');

class MQTTService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscribedTopics = new Set();
    this.deviceTopics = new Map(); // Map deviceId -> topics
  }
  
  connect() {
    // Connect to MQTT broker
    logger.info(`Connecting to MQTT broker: ${mqttConfig.brokerUrl}`);
    
    this.client = mqtt.connect(mqttConfig.brokerUrl, mqttConfig.options);
    
    // Set up event handlers
    this.client.on('connect', this.handleConnect.bind(this));
    this.client.on('reconnect', this.handleReconnect.bind(this));
    this.client.on('error', this.handleError.bind(this));
    this.client.on('message', this.handleMessage.bind(this));
    this.client.on('disconnect', this.handleDisconnect.bind(this));
    
    return this;
  }
  
  async handleConnect() {
    this.connected = true;
    logger.info('Connected to MQTT broker');
    
    // Subscribe to common topics
    await this.subscribeToTopic(mqttConfig.topics.deviceData);
    await this.subscribeToTopic(mqttConfig.topics.deviceSwitches);
    
    // Subscribe to specific device topics from database
    await this.subscribeToAllDevices();
  }
  
  handleReconnect() {
    logger.info('Reconnecting to MQTT broker...');
  }
  
  handleError(error) {
    logger.error(`MQTT error: ${error.message}`);
  }
  
  handleDisconnect() {
    this.connected = false;
    logger.info('Disconnected from MQTT broker');
  }
  
  async handleMessage(topic, message) {
    try {
      logger.debug(`Message received on topic ${topic}: ${message.toString()}`);
      
      // Parse the message
      const data = JSON.parse(message.toString());
      
      // Extract deviceId from topic
      let deviceId;
      
      // Handle different topic patterns
      if (topic.match(/devices\/([^\/]+)\/data/)) {
        deviceId = topic.split('/')[1];
        await this.handleDeviceData(deviceId, data);
      } else if (topic.match(/devices\/([^\/]+)\/switches/)) {
        deviceId = topic.split('/')[1];
        
        // If it's a specific switch or all switches
        if (topic.match(/devices\/([^\/]+)\/switches\/([^\/]+)/)) {
          const switchId = topic.split('/')[3];
          await this.handleSwitchUpdate(deviceId, switchId, data);
        } else {
          await this.handleAllSwitchesUpdate(deviceId, data);
        }
      }
    } catch (error) {
      logger.error(`Error handling MQTT message: ${error.message}`);
    }
  }
  
  async disconnect() {
    if (this.client && this.connected) {
      return new Promise((resolve) => {
        this.client.end(false, () => {
          this.connected = false;
          logger.info('Disconnected from MQTT broker');
          resolve();
        });
      });
    }
  }
  
  async subscribeToTopic(topic) {
    if (!this.client || !this.connected) {
      logger.error(`Cannot subscribe to ${topic}: not connected to MQTT broker`);
      return false;
    }
    
    return new Promise((resolve) => {
      this.client.subscribe(topic, (err) => {
        if (err) {
          logger.error(`Error subscribing to ${topic}: ${err.message}`);
          resolve(false);
        } else {
          logger.info(`Subscribed to topic: ${topic}`);
          this.subscribedTopics.add(topic);
          resolve(true);
        }
      });
    });
  }
  
  async unsubscribeFromTopic(topic) {
    if (!this.client || !this.connected) {
      logger.error(`Cannot unsubscribe from ${topic}: not connected to MQTT broker`);
      return false;
    }
    
    return new Promise((resolve) => {
      this.client.unsubscribe(topic, (err) => {
        if (err) {
          logger.error(`Error unsubscribing from ${topic}: ${err.message}`);
          resolve(false);
        } else {
          logger.info(`Unsubscribed from topic: ${topic}`);
          this.subscribedTopics.delete(topic);
          resolve(true);
        }
      });
    });
  }
  
  async publishMessage(topic, message) {
    if (!this.client || !this.connected) {
      logger.error(`Cannot publish to ${topic}: not connected to MQTT broker`);
      return false;
    }
    
    return new Promise((resolve) => {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      
      this.client.publish(topic, messageStr, { qos: 1 }, (err) => {
        if (err) {
          logger.error(`Error publishing to ${topic}: ${err.message}`);
          resolve(false);
        } else {
          logger.info(`Published to topic: ${topic}`);
          resolve(true);
        }
      });
    });
  }
  
  async subscribeToAllDevices() {
    try {
      const devices = await Device.find({});
      
      devices.forEach(async (device) => {
        const topicPrefix = device.mqttConfig?.topicPrefix || `devices/${device._id}`;
        await this.subscribeToDevice(device._id.toString(), topicPrefix);
      });
    } catch (error) {
      logger.error(`Error subscribing to all devices: ${error.message}`);
    }
  }
  
  async subscribeToDevice(deviceId, topicPrefix) {
    // Create array of topics for this device
    const topics = [
      `${topicPrefix}/data`,
      `${topicPrefix}/switches`,
      `${topicPrefix}/switches/+`
    ];
    
    // Store device topics
    this.deviceTopics.set(deviceId, topics);
    
    // Subscribe to each topic
    for (const topic of topics) {
      await this.subscribeToTopic(topic);
    }
  }
  
  async unsubscribeFromDevice(deviceId, topicPrefix) {
    // Get device topics
    const topics = this.deviceTopics.get(deviceId) || [
      `${topicPrefix}/data`,
      `${topicPrefix}/switches`,
      `${topicPrefix}/switches/+`
    ];
    
    // Unsubscribe from each topic
    for (const topic of topics) {
      await this.unsubscribeFromTopic(topic);
    }
    
    // Remove device topics
    this.deviceTopics.delete(deviceId);
  }
  
  async updateDeviceSubscription(deviceId, oldTopicPrefix, newTopicPrefix) {
    // Unsubscribe from old topics
    if (oldTopicPrefix) {
      await this.unsubscribeFromDevice(deviceId, oldTopicPrefix);
    }
    
    // Subscribe to new topics
    if (newTopicPrefix) {
      await this.subscribeToDevice(deviceId, newTopicPrefix);
    }
  }
  
  async handleDeviceData(deviceId, data) {
    try {
      // Update device sensorData
      const device = await Device.findById(deviceId);
      
      if (!device) {
        logger.warn(`Received data for unknown device: ${deviceId}`);
        return;
      }
      
      // Update device sensorData and online status
      await Device.findByIdAndUpdate(deviceId, {
        sensorData: {
          current: data.current,
          voltage: data.voltage,
          timestamp: new Date()
        },
        isOnline: true,
        lastUpdate: new Date()
      });
      
      // Store in history
      await History.create({
        deviceId,
        current: data.current,
        voltage: data.voltage,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error(`Error handling device data: ${error.message}`);
    }
  }
  
  async handleSwitchUpdate(deviceId, switchId, data) {
    try {
      const device = await Device.findById(deviceId);
      
      if (!device) {
        logger.warn(`Received switch update for unknown device: ${deviceId}`);
        return;
      }
      
      // Find the switch
      const switchIndex = device.switches.findIndex(s => s.id === switchId);
      
      if (switchIndex === -1) {
        logger.warn(`Received update for unknown switch: ${switchId} on device ${deviceId}`);
        return;
      }
      
      // Update switch state
      device.switches[switchIndex].state = data.state;
      await device.save();
    } catch (error) {
      logger.error(`Error handling switch update: ${error.message}`);
    }
  }
  
  async handleAllSwitchesUpdate(deviceId, data) {
    try {
      const device = await Device.findById(deviceId);
      
      if (!device) {
        logger.warn(`Received switches update for unknown device: ${deviceId}`);
        return;
      }
      
      // Update all switches
      if (Array.isArray(data.switches)) {
        // Replace entire switches array
        device.switches = data.switches;
      } else if (typeof data.switches === 'object') {
        // Update individual switches by ID
        for (const switchId in data.switches) {
          const switchIndex = device.switches.findIndex(s => s.id === switchId);
          if (switchIndex !== -1) {
            device.switches[switchIndex] = {
              ...device.switches[switchIndex],
              ...data.switches[switchId]
            };
          }
        }
      }
      
      await device.save();
    } catch (error) {
      logger.error(`Error handling all switches update: ${error.message}`);
    }
  }
}

module.exports = new MQTTService();
