
import { Device, HistoryData } from "@/types/device";
import mqttService from "@/services/mqttService";
import mongoService from "@/services/mongoService";

// Mock data generation for demo purposes
const generateMockDevices = (): Device[] => {
  return [
    {
      _id: "dev-001",
      name: "Living Room Controller",
      macAddress: "AA:BB:CC:11:22:33",
      isOnline: true,
      lastUpdate: new Date().toISOString(),
      location: "Living Room",
      description: "Controls lighting and appliances in the living room",
      mqttTopic: "home/living-room",
      switches: [
        { id: "sw1", name: "Main Light", state: true, icon: "light", color: "yellow" },
        { id: "sw2", name: "Floor Lamp", state: false, icon: "light", color: "blue" },
        { id: "sw3", name: "TV", state: true, icon: "tv", color: "purple" },
        { id: "sw4", name: "Fan", state: false, icon: "fan", color: "green" },
      ],
      sensorData: {
        current: 2.4,
        voltage: 220.5,
      },
      mqttConfig: {
        brokerUrl: "mqtt://broker.example.com:1883",
        username: "demo_user",
        password: "demo_pass",
        clientId: "esp32_dev001",
        topicPrefix: "devices/living-room",
        qos: 1,
      },
      mongoConfig: {
        connectionString: "mongodb://localhost:27017",
        database: "iot_data",
        collection: "device_data",
        retentionDays: 30,
      },
    },
    {
      _id: "dev-002",
      name: "Kitchen Hub",
      macAddress: "AA:BB:CC:44:55:66",
      isOnline: true,
      lastUpdate: new Date().toISOString(),
      location: "Kitchen",
      description: "Controls kitchen appliances",
      mqttTopic: "home/kitchen",
      switches: [
        { id: "sw1", name: "Ceiling Light", state: true, icon: "light", color: "yellow" },
        { id: "sw2", name: "Counter Light", state: true, icon: "light", color: "blue" },
        { id: "sw3", name: "Microwave", state: false, icon: "power", color: "red" },
        { id: "sw4", name: "Dishwasher", state: false, icon: "power", color: "green" },
      ],
      sensorData: {
        current: 1.8,
        voltage: 221.2,
      },
      mqttConfig: {
        brokerUrl: "mqtt://broker.example.com:1883",
        username: "demo_user",
        password: "demo_pass",
        clientId: "esp32_dev002",
        topicPrefix: "devices/kitchen",
        qos: 1,
      },
      mongoConfig: {
        connectionString: "mongodb://localhost:27017",
        database: "iot_data",
        collection: "device_data",
        retentionDays: 30,
      },
    },
  ];
};

let mockDevices = generateMockDevices();

// Initialize connections
(async () => {
  try {
    // Connect to MQTT broker using the first device's config as default
    if (mockDevices.length > 0 && mockDevices[0].mqttConfig) {
      await mqttService.connect(
        mockDevices[0].mqttConfig.brokerUrl, 
        { 
          username: mockDevices[0].mqttConfig.username, 
          password: mockDevices[0].mqttConfig.password 
        }
      );
    }
    
    // Connect to MongoDB using the first device's config as default
    if (mockDevices.length > 0 && mockDevices[0].mongoConfig) {
      await mongoService.connect(
        mockDevices[0].mongoConfig.connectionString,
        mockDevices[0].mongoConfig.database
      );
    }
    
    // Set up simulated data generation
    startDataSimulation();
  } catch (error) {
    console.error("Failed to initialize connections", error);
  }
})();

// Simulate periodic sensor data updates
const startDataSimulation = () => {
  setInterval(() => {
    mockDevices.forEach(device => {
      if (device.isOnline) {
        // Calculate power consumption based on switch states
        const activeSwtiches = device.switches.filter(sw => sw.state).length;
        const baseCurrent = 0.5; // Base current (0.5A)
        const switchCurrent = 0.5; // Current per active switch (0.5A)
        
        // Current with small random variations
        const current = baseCurrent + (activeSwtiches * switchCurrent) + (Math.random() * 0.2 - 0.1);
        
        // Voltage with small random variations
        const voltage = 220 + (Math.random() * 4 - 2);
        
        // Update device data
        const sensorData = {
          current,
          voltage,
          timestamp: new Date().toISOString(),
        };
        
        // Update in-memory device
        const deviceIndex = mockDevices.findIndex(d => d._id === device._id);
        if (deviceIndex >= 0) {
          mockDevices[deviceIndex].sensorData = sensorData;
          mockDevices[deviceIndex].lastUpdate = sensorData.timestamp;
        }
        
        // Save to MongoDB
        mongoService.saveDeviceData(device._id, sensorData);
        
        // Publish to MQTT
        mqttService.simulateDeviceData(device, sensorData);
      }
    });
  }, 5000); // Update every 5 seconds
};

// Fetch all devices
export const fetchDevices = async (): Promise<Device[]> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return mockDevices;
};

// Fetch a single device by ID
export const fetchDeviceById = async (id: string): Promise<Device> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const device = mockDevices.find(d => d._id === id);
  
  if (!device) {
    throw new Error(`Device with ID ${id} not found`);
  }
  
  return device;
};

// Create a new device
export const createDevice = async (deviceData: any): Promise<Device> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newDevice: Device = {
    _id: `dev-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    name: deviceData.name,
    macAddress: deviceData.macAddress,
    isOnline: true,
    lastUpdate: new Date().toISOString(),
    location: deviceData.location || "",
    description: deviceData.description || "",
    mqttTopic: deviceData.mqttTopic || `device/${Math.random().toString(36).substring(2, 15)}`,
    switches: deviceData.switches.map((sw: any, index: number) => ({
      id: `sw${index + 1}`,
      name: sw.name || `Switch ${index + 1}`,
      state: sw.state || false,
      icon: sw.icon || "power",
      color: sw.color || "green",
    })),
    sensorData: {
      current: Math.random() * 3 + 0.5, // Random value between 0.5 and 3.5
      voltage: 220 + (Math.random() * 5 - 2.5), // Random value around 220V
    },
    mqttConfig: {
      brokerUrl: "mqtt://broker.example.com:1883",
      username: "user",
      password: "pass",
      clientId: `esp32_${Math.random().toString(36).substring(2, 10)}`,
      topicPrefix: `devices/${Math.random().toString(36).substring(2, 10)}`,
      qos: 1,
    },
    mongoConfig: {
      connectionString: "mongodb://localhost:27017",
      database: "iot_data",
      collection: `device_${Math.random().toString(36).substring(2, 10)}`,
      retentionDays: 30,
    },
  };
  
  mockDevices = [...mockDevices, newDevice];
  
  return newDevice;
};

// Update an existing device
export const updateDevice = async (data: { id: string; deviceData: any }): Promise<Device> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const { id, deviceData } = data;
  
  const deviceIndex = mockDevices.findIndex(d => d._id === id);
  
  if (deviceIndex === -1) {
    throw new Error(`Device with ID ${id} not found`);
  }
  
  const updatedDevice = {
    ...mockDevices[deviceIndex],
    ...deviceData,
    lastUpdate: new Date().toISOString(),
  };
  
  mockDevices = [
    ...mockDevices.slice(0, deviceIndex),
    updatedDevice,
    ...mockDevices.slice(deviceIndex + 1),
  ];
  
  // If MQTT config was updated, try to reconnect
  if (deviceData.mqttConfig && updatedDevice.mqttConfig) {
    console.log("MQTT config updated, reconnecting...");
    // In a real application, you would reconnect using the new config
  }
  
  // If MongoDB config was updated, try to reconnect
  if (deviceData.mongoConfig && updatedDevice.mongoConfig) {
    console.log("MongoDB config updated, reconnecting...");
    // In a real application, you would reconnect using the new config
  }
  
  return updatedDevice;
};

// Update a specific switch on a device
export const updateDeviceSwitch = async (data: { deviceId: string; switchId: string; state: boolean }): Promise<Device> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const { deviceId, switchId, state } = data;
  
  const deviceIndex = mockDevices.findIndex(d => d._id === deviceId);
  
  if (deviceIndex === -1) {
    throw new Error(`Device with ID ${deviceId} not found`);
  }
  
  const device = mockDevices[deviceIndex];
  const switchIndex = device.switches.findIndex(s => s.id === switchId);
  
  if (switchIndex === -1) {
    throw new Error(`Switch with ID ${switchId} not found on device ${deviceId}`);
  }
  
  const updatedSwitches = [...device.switches];
  updatedSwitches[switchIndex] = {
    ...updatedSwitches[switchIndex],
    state,
  };
  
  const updatedDevice = {
    ...device,
    switches: updatedSwitches,
    lastUpdate: new Date().toISOString(),
  };
  
  mockDevices = [
    ...mockDevices.slice(0, deviceIndex),
    updatedDevice,
    ...mockDevices.slice(deviceIndex + 1),
  ];
  
  // Send the command via MQTT
  mqttService.toggleDeviceSwitch(device, switchId, state);
  
  return updatedDevice;
};

// Delete a device
export const deleteDevice = async (id: string): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const deviceIndex = mockDevices.findIndex(d => d._id === id);
  
  if (deviceIndex === -1) {
    throw new Error(`Device with ID ${id} not found`);
  }
  
  mockDevices = [
    ...mockDevices.slice(0, deviceIndex),
    ...mockDevices.slice(deviceIndex + 1),
  ];
};

// Fetch historical data for a device
export const fetchDeviceHistory = async (deviceId: string, timeRange: string = "day"): Promise<HistoryData[]> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const now = new Date();
  let startDate = new Date(now);
  
  // Set time range
  switch (timeRange) {
    case "day":
      startDate.setDate(now.getDate() - 1);
      break;
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 1);
  }
  
  // Try to get data from MongoDB service
  try {
    const history = await mongoService.getDeviceHistory(deviceId, {
      startDate,
      endDate: now,
      limit: timeRange === "day" ? 24 : timeRange === "week" ? 7 * 24 : 30 * 24,
    });
    
    if (history && history.length > 0) {
      return history;
    }
  } catch (error) {
    console.error("Error fetching device history from MongoDB", error);
  }
  
  // Fallback to generating mock data
  return generateMockHistory(timeRange);
};

// Mock history data generation (fallback)
const generateMockHistory = (timeRange: string): HistoryData[] => {
  const now = new Date();
  const data: HistoryData[] = [];
  
  let points = 24;
  let interval = 60 * 60 * 1000; // 1 hour in milliseconds
  
  if (timeRange === "week") {
    points = 7 * 24;
    interval = 60 * 60 * 1000; // 1 hour
  } else if (timeRange === "month") {
    points = 30;
    interval = 24 * 60 * 60 * 1000; // 1 day
  }
  
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * interval);
    
    // Generate some variation in the values
    const baseVoltage = 220 + (Math.random() * 5 - 2.5);
    const baseCurrent = 2 + (Math.random() * 3);
    
    // Add a daily pattern for more realistic data
    const hourOfDay = timestamp.getHours();
    const timeMultiplier = hourOfDay >= 7 && hourOfDay <= 22 ? 1 + (Math.random() * 0.5) : 0.5 + (Math.random() * 0.3);
    
    data.push({
      timestamp: timestamp.toISOString(),
      voltage: baseVoltage,
      current: baseCurrent * timeMultiplier,
    });
  }
  
  return data;
};

// Test MQTT connection
export const testMQTTConnection = async (config: { 
  brokerUrl: string, 
  username?: string, 
  password?: string 
}): Promise<{ success: boolean, message: string }> => {
  try {
    // Disconnect from current connection first
    await mqttService.disconnect();
    
    // Try to connect with new config
    const connected = await mqttService.connect(
      config.brokerUrl, 
      { 
        username: config.username, 
        password: config.password 
      }
    );
    
    if (connected) {
      return {
        success: true,
        message: "Successfully connected to MQTT broker"
      };
    } else {
      return {
        success: false,
        message: "Failed to connect to MQTT broker"
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error connecting to MQTT broker: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

// Test MongoDB connection
export const testMongoDBConnection = async (config: { 
  connectionString: string, 
  database: string 
}): Promise<{ success: boolean, message: string }> => {
  try {
    return await mongoService.testConnection(
      config.connectionString,
      config.database
    );
  } catch (error) {
    return {
      success: false,
      message: `Error connecting to MongoDB: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};
