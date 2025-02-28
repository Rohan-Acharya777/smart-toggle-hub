
export interface SwitchData {
  id: string;
  name: string;
  state: boolean;
  icon?: string;
  color?: string;
}

export interface SensorData {
  current: number;
  voltage: number;
  timestamp?: string;
}

export interface MQTTConfig {
  brokerUrl: string;
  username?: string;
  password?: string;
  clientId: string;
  topicPrefix: string;
  qos: 0 | 1 | 2;
}

export interface MongoDBConfig {
  connectionString: string;
  database: string;
  collection: string;
  retentionDays: number;
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
  mqttConfig?: MQTTConfig;
  mongoConfig?: MongoDBConfig;
}

export interface HistoryData {
  timestamp: string;
  current: number;
  voltage: number;
}
