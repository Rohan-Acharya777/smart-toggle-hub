
import { Device, SwitchData } from "@/types/device";

// This is a mock MQTT service - in a real application, 
// you would use a library like mqtt.js or paho-mqtt
export class MQTTService {
  private static instance: MQTTService;
  private connected: boolean = false;
  private clientId: string = `web_${Math.random().toString(16).substring(2, 10)}`;
  private subscribers: Map<string, ((message: any) => void)[]> = new Map();
  private reconnectTimer: number | null = null;
  
  // In a real application, these would be actual MQTT connections
  private simulatedDeviceData: Map<string, any> = new Map();
  
  private constructor() {
    // Initialize with simulated data
    console.log("MQTT Service initialized");
  }
  
  public static getInstance(): MQTTService {
    if (!MQTTService.instance) {
      MQTTService.instance = new MQTTService();
    }
    return MQTTService.instance;
  }
  
  public async connect(brokerUrl: string, options?: { username?: string, password?: string }): Promise<boolean> {
    // In a real application, connect to the MQTT broker
    console.log(`Connecting to MQTT broker: ${brokerUrl}`);
    
    // Simulate connection process
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = true;
        console.log("Connected to MQTT broker");
        resolve(true);
      }, 1000);
    });
  }
  
  public isConnected(): boolean {
    return this.connected;
  }
  
  public async disconnect(): Promise<void> {
    if (!this.connected) return;
    
    // In a real application, disconnect from the MQTT broker
    console.log("Disconnecting from MQTT broker");
    
    // Simulate disconnection process
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = false;
        console.log("Disconnected from MQTT broker");
        resolve();
      }, 500);
    });
  }
  
  public async subscribe(topic: string, callback: (message: any) => void): Promise<boolean> {
    if (!this.connected) {
      console.error("Cannot subscribe - not connected to MQTT broker");
      return false;
    }
    
    console.log(`Subscribing to topic: ${topic}`);
    
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    
    this.subscribers.get(topic)?.push(callback);
    
    // Simulate subscription process
    // In a real application, this would be an actual MQTT subscription
    return true;
  }
  
  public async publish(topic: string, message: any): Promise<boolean> {
    if (!this.connected) {
      console.error("Cannot publish - not connected to MQTT broker");
      return false;
    }
    
    console.log(`Publishing to topic: ${topic}`, message);
    
    // Simulate message publishing
    // In a real application, this would be an actual MQTT publish
    
    // Store the message for simulation purposes
    this.simulatedDeviceData.set(topic, message);
    
    // Notify subscribers
    setTimeout(() => {
      this.notifySubscribers(topic, message);
    }, 200);
    
    return true;
  }
  
  private notifySubscribers(topic: string, message: any): void {
    // In a real application, this would happen when messages arrive from the broker
    const callbacks = this.subscribers.get(topic);
    
    if (callbacks && callbacks.length > 0) {
      callbacks.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error("Error in subscriber callback", error);
        }
      });
    }
  }
  
  // For a real device, we'd use these methods to control switches
  public async toggleDeviceSwitch(device: Device, switchId: string, state: boolean): Promise<boolean> {
    const topic = `${device.mqttConfig?.topicPrefix || `devices/${device._id}`}/switches/${switchId}`;
    return this.publish(topic, { state });
  }
  
  public async updateAllSwitches(device: Device, switches: SwitchData[]): Promise<boolean> {
    const topic = `${device.mqttConfig?.topicPrefix || `devices/${device._id}`}/switches`;
    return this.publish(topic, { switches });
  }
  
  // Simulate receiving data from a device
  public simulateDeviceData(device: Device, data: any): void {
    const topic = `${device.mqttConfig?.topicPrefix || `devices/${device._id}`}/data`;
    this.notifySubscribers(topic, data);
  }
}

export default MQTTService.getInstance();
