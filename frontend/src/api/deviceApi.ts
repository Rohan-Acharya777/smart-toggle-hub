
import { Device, HistoryData } from "@/types/device";

// Backend API URL
const API_URL = "http://localhost:5000/api";

// Auth token (TODO: implement proper auth)
const getToken = () => localStorage.getItem('token') || '';

// Headers for API requests
const headers = () => ({
  'Content-Type': 'application/json',
  'x-auth-token': getToken()
});

// Helper function for API requests
const apiRequest = async (endpoint: string, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: headers(),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'API returned an error');
    }
    
    return data.data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Fetch all devices
export const fetchDevices = async (): Promise<Device[]> => {
  return apiRequest('/devices');
};

// Fetch a single device by ID
export const fetchDeviceById = async (id: string): Promise<Device> => {
  return apiRequest(`/devices/${id}`);
};

// Create a new device
export const createDevice = async (deviceData: any): Promise<Device> => {
  return apiRequest('/devices', {
    method: 'POST',
    body: JSON.stringify(deviceData)
  });
};

// Update an existing device
export const updateDevice = async (data: { id: string; deviceData: any }): Promise<Device> => {
  const { id, deviceData } = data;
  
  return apiRequest(`/devices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(deviceData)
  });
};

// Update a specific switch on a device
export const updateDeviceSwitch = async (data: { deviceId: string; switchId: string; state: boolean }): Promise<Device> => {
  const { deviceId, switchId, state } = data;
  
  return apiRequest(`/devices/${deviceId}/switches/${switchId}`, {
    method: 'PATCH',
    body: JSON.stringify({ state })
  });
};

// Delete a device
export const deleteDevice = async (id: string): Promise<void> => {
  await apiRequest(`/devices/${id}`, {
    method: 'DELETE'
  });
};

// Fetch historical data for a device
export const fetchDeviceHistory = async (deviceId: string, timeRange: string = "day"): Promise<HistoryData[]> => {
  return apiRequest(`/history/devices/${deviceId}?timeRange=${timeRange}`);
};

// Get device statistics
export const fetchDeviceStats = async (deviceId: string, timeRange: string = "day"): Promise<any> => {
  return apiRequest(`/history/devices/${deviceId}/stats?timeRange=${timeRange}`);
};

// Register a new user
export const register = async (userData: { name: string, email: string, password: string }): Promise<any> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Registration failed');
  }
  
  // Store token
  localStorage.setItem('token', data.data.token);
  
  return data.data;
};

// Login user
export const login = async (credentials: { email: string, password: string }): Promise<any> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Login failed');
  }
  
  // Store token
  localStorage.setItem('token', data.data.token);
  
  return data.data;
};

// Get current user
export const getCurrentUser = async (): Promise<any> => {
  return apiRequest('/auth/me');
};

// Test MQTT connection
export const testMQTTConnection = async (config: { 
  brokerUrl: string, 
  username?: string, 
  password?: string 
}): Promise<{ success: boolean, message: string }> => {
  try {
    const response = await fetch(`${API_URL}/devices/test-mqtt`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(config)
    });
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    return {
      success: false,
      message: `Error testing MQTT connection: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

// Test MongoDB connection
export const testMongoDBConnection = async (config: { 
  connectionString: string, 
  database: string 
}): Promise<{ success: boolean, message: string }> => {
  try {
    const response = await fetch(`${API_URL}/devices/test-mongodb`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(config)
    });
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    return {
      success: false,
      message: `Error testing MongoDB connection: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};
