
import { Device, HistoryData } from "@/types/device";

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
        { id: "sw1", name: "Main Light", state: true },
        { id: "sw2", name: "Floor Lamp", state: false },
        { id: "sw3", name: "TV", state: true },
        { id: "sw4", name: "Fan", state: false },
      ],
      sensorData: {
        current: 2.4,
        voltage: 220.5,
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
        { id: "sw1", name: "Ceiling Light", state: true },
        { id: "sw2", name: "Counter Light", state: true },
        { id: "sw3", name: "Microwave", state: false },
        { id: "sw4", name: "Dishwasher", state: false },
      ],
      sensorData: {
        current: 1.8,
        voltage: 221.2,
      },
    },
  ];
};

// Mock history data generation
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

let mockDevices = generateMockDevices();

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
    })),
    sensorData: {
      current: Math.random() * 3 + 0.5, // Random value between 0.5 and 3.5
      voltage: 220 + (Math.random() * 5 - 2.5), // Random value around 220V
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
  
  // In a real app, you'd fetch data from a backend API based on the deviceId
  return generateMockHistory(timeRange);
};
