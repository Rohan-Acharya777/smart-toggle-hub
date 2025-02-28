
module.exports = {
  brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  options: {
    clientId: `iot_backend_${Math.random().toString(16).substring(2, 10)}`,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30000
  },
  topics: {
    deviceData: 'devices/+/data',
    deviceSwitches: 'devices/+/switches/#'
  }
};
