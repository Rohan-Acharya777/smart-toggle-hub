
import { Device, HistoryData } from "@/types/device";

// This is a mock MongoDB service - in a real application, 
// you would use a server-side implementation with MongoDB driver or ORM
export class MongoDBService {
  private static instance: MongoDBService;
  private connected: boolean = false;
  private connectionString: string = "";
  private database: string = "";
  
  // In a real application, this would be backed by actual MongoDB collections
  private deviceData: Map<string, any[]> = new Map();
  
  private constructor() {
    // Initialize
    console.log("MongoDB Service initialized");
    
    // Pre-populate with some sample data
    this.generateSampleData();
  }
  
  public static getInstance(): MongoDBService {
    if (!MongoDBService.instance) {
      MongoDBService.instance = new MongoDBService();
    }
    return MongoDBService.instance;
  }
  
  public async connect(connectionString: string, database: string): Promise<boolean> {
    // In a real application, connect to MongoDB
    console.log(`Connecting to MongoDB: ${connectionString}, database: ${database}`);
    
    this.connectionString = connectionString;
    this.database = database;
    
    // Simulate connection process
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = true;
        console.log("Connected to MongoDB");
        resolve(true);
      }, 1000);
    });
  }
  
  public isConnected(): boolean {
    return this.connected;
  }
  
  public async disconnect(): Promise<void> {
    if (!this.connected) return;
    
    // In a real application, disconnect from MongoDB
    console.log("Disconnecting from MongoDB");
    
    // Simulate disconnection process
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = false;
        console.log("Disconnected from MongoDB");
        resolve();
      }, 500);
    });
  }
  
  public async saveDeviceData(deviceId: string, data: any): Promise<boolean> {
    if (!this.connected) {
      console.error("Cannot save data - not connected to MongoDB");
      return false;
    }
    
    console.log(`Saving data for device ${deviceId}`, data);
    
    // In a real application, this would insert data into a MongoDB collection
    
    // For simulation, store in memory
    if (!this.deviceData.has(deviceId)) {
      this.deviceData.set(deviceId, []);
    }
    
    const deviceHistory = this.deviceData.get(deviceId);
    if (deviceHistory) {
      deviceHistory.push({
        ...data,
        timestamp: new Date().toISOString()
      });
      
      // Limit history size for simulation
      if (deviceHistory.length > 500) {
        deviceHistory.shift(); // Remove oldest entry
      }
    }
    
    return true;
  }
  
  public async getDeviceHistory(
    deviceId: string, 
    options: { 
      startDate?: Date, 
      endDate?: Date, 
      limit?: number 
    } = {}
  ): Promise<HistoryData[]> {
    if (!this.connected) {
      console.error("Cannot get history - not connected to MongoDB");
      return [];
    }
    
    console.log(`Getting history for device ${deviceId}`, options);
    
    // In a real application, this would query MongoDB
    
    // For simulation, return in-memory data
    const deviceHistory = this.deviceData.get(deviceId) || [];
    
    let filteredHistory = [...deviceHistory];
    
    // Apply date filters if provided
    if (options.startDate) {
      filteredHistory = filteredHistory.filter(
        item => new Date(item.timestamp) >= options.startDate!
      );
    }
    
    if (options.endDate) {
      filteredHistory = filteredHistory.filter(
        item => new Date(item.timestamp) <= options.endDate!
      );
    }
    
    // Apply limit if provided
    if (options.limit && options.limit > 0) {
      filteredHistory = filteredHistory.slice(-options.limit);
    }
    
    return filteredHistory as HistoryData[];
  }
  
  public async testConnection(connectionString: string, database: string): Promise<{ success: boolean, message: string }> {
    // Simulate a connection test
    console.log(`Testing MongoDB connection: ${connectionString}, database: ${database}`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // 90% chance of success for simulation
        const success = Math.random() < 0.9;
        
        if (success) {
          resolve({
            success: true,
            message: "Successfully connected to MongoDB"
          });
        } else {
          resolve({
            success: false,
            message: "Failed to connect to MongoDB - check your connection string and credentials"
          });
        }
      }, 1000);
    });
  }
  
  private generateSampleData(): void {
    // Generate sample data for demo purposes
    const deviceIds = ['dev-001', 'dev-002'];
    const now = new Date();
    
    for (const deviceId of deviceIds) {
      const history: any[] = [];
      
      // Generate data for the past 7 days
      for (let i = 0; i < 24 * 7; i++) {
        const timestamp = new Date(now);
        timestamp.setHours(now.getHours() - i);
        
        // Simulate some realistic variations
        const hourOfDay = timestamp.getHours();
        const usagePattern = hourOfDay >= 7 && hourOfDay <= 22 ? 
          0.7 + Math.random() * 0.3 : // Higher during day
          0.2 + Math.random() * 0.3;  // Lower at night
        
        const voltage = 220 + (Math.random() * 10 - 5); // Variation around 220V
        const current = usagePattern * 3; // Up to 3A
        
        history.push({
          timestamp: timestamp.toISOString(),
          voltage,
          current,
          power: voltage * current, // Power in watts
        });
      }
      
      this.deviceData.set(deviceId, history);
    }
  }
}

export default MongoDBService.getInstance();
