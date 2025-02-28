
export interface SwitchData {
  id: string;
  name: string;
  state: boolean;
}

export interface SensorData {
  current: number;
  voltage: number;
  timestamp?: string;
}

export interface Device {
  _id: string;
  name: string;
  macAddress: string;
  isOnline: boolean;
  lastUpdate: string;
  location?: string;
  description?: string;
  mqttTopic?: string;
  switches: SwitchData[];
  sensorData: SensorData;
}

export interface HistoryData {
  timestamp: string;
  current: number;
  voltage: number;
}
