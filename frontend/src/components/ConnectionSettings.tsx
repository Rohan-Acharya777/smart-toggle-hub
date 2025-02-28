
import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Device, MQTTConfig, MongoDBConfig } from "@/types/device";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, RefreshCw, Database, Wifi } from "lucide-react";
import { testMQTTConnection, testMongoDBConnection } from "@/api/deviceApi";

interface ConnectionSettingsProps {
  device: Device;
  onUpdate: (updatedDevice: Partial<Device>) => void;
}

const mqttSchema = z.object({
  brokerUrl: z.string().url({
    message: "Please enter a valid URL (e.g., mqtt://broker.example.com:1883)",
  }),
  username: z.string().optional(),
  password: z.string().optional(),
  clientId: z.string().min(1, {
    message: "Client ID is required",
  }),
  topicPrefix: z.string().min(1, {
    message: "Topic prefix is required",
  }),
  qos: z.enum(["0", "1", "2"]),
});

const mongoSchema = z.object({
  connectionString: z.string().min(10, {
    message: "Please enter a valid MongoDB connection string",
  }),
  database: z.string().min(1, {
    message: "Database name is required",
  }),
  collection: z.string().min(1, {
    message: "Collection name is required",
  }),
  retentionDays: z.string().min(1).regex(/^\d+$/, {
    message: "Please enter a valid number",
  }),
});

const ConnectionSettings = ({ device, onUpdate }: ConnectionSettingsProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("mqtt");
  const [testingConnection, setTestingConnection] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Default MQTT config
  const defaultMqttConfig: MQTTConfig = device.mqttConfig || {
    brokerUrl: "mqtt://broker.example.com:1883",
    username: "",
    password: "",
    clientId: `esp32_${device._id}`,
    topicPrefix: `devices/${device._id}`,
    qos: 0,
  };

  // Default MongoDB config
  const defaultMongoConfig: MongoDBConfig = device.mongoConfig || {
    connectionString: "mongodb://localhost:27017",
    database: "iot_data",
    collection: `device_${device._id}`,
    retentionDays: 30,
  };

  const mqttForm = useForm<z.infer<typeof mqttSchema>>({
    resolver: zodResolver(mqttSchema),
    defaultValues: {
      brokerUrl: defaultMqttConfig.brokerUrl,
      username: defaultMqttConfig.username || "",
      password: defaultMqttConfig.password || "",
      clientId: defaultMqttConfig.clientId,
      topicPrefix: defaultMqttConfig.topicPrefix,
      qos: defaultMqttConfig.qos.toString() as "0" | "1" | "2",
    },
  });

  const mongoForm = useForm<z.infer<typeof mongoSchema>>({
    resolver: zodResolver(mongoSchema),
    defaultValues: {
      connectionString: defaultMongoConfig.connectionString,
      database: defaultMongoConfig.database,
      collection: defaultMongoConfig.collection,
      retentionDays: defaultMongoConfig.retentionDays.toString(),
    },
  });

  const onMqttSubmit = async (values: z.infer<typeof mqttSchema>) => {
    setIsUpdating(true);
    
    try {
      const mqttConfig: MQTTConfig = {
        brokerUrl: values.brokerUrl,
        username: values.username || undefined,
        password: values.password || undefined,
        clientId: values.clientId,
        topicPrefix: values.topicPrefix,
        qos: parseInt(values.qos) as 0 | 1 | 2,
      };
      
      await onUpdate({
        mqttConfig,
      });
      
      toast({
        title: "Success",
        description: "MQTT settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update MQTT settings",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const onMongoSubmit = async (values: z.infer<typeof mongoSchema>) => {
    setIsUpdating(true);
    
    try {
      const mongoConfig: MongoDBConfig = {
        connectionString: values.connectionString,
        database: values.database,
        collection: values.collection,
        retentionDays: parseInt(values.retentionDays),
      };
      
      await onUpdate({
        mongoConfig,
      });
      
      toast({
        title: "Success",
        description: "MongoDB settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update MongoDB settings",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const testConnection = async (type: 'mqtt' | 'mongodb') => {
    setTestingConnection(true);
    
    try {
      if (type === 'mqtt') {
        const mqttValues = mqttForm.getValues();
        const result = await testMQTTConnection({
          brokerUrl: mqttValues.brokerUrl,
          username: mqttValues.username || undefined,
          password: mqttValues.password || undefined,
        });
        
        if (result.success) {
          toast({
            title: "Connection Test",
            description: result.message,
          });
        } else {
          toast({
            title: "Connection Test Failed",
            description: result.message,
            variant: "destructive",
          });
        }
      } else {
        const mongoValues = mongoForm.getValues();
        const result = await testMongoDBConnection({
          connectionString: mongoValues.connectionString,
          database: mongoValues.database,
        });
        
        if (result.success) {
          toast({
            title: "Connection Test",
            description: result.message,
          });
        } else {
          toast({
            title: "Connection Test Failed",
            description: result.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to test connection: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <Tabs
      defaultValue="mqtt"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-2 mb-6">
        <TabsTrigger value="mqtt" className="flex items-center">
          <Wifi className="mr-2 h-4 w-4" />
          MQTT Settings
        </TabsTrigger>
        <TabsTrigger value="mongodb" className="flex items-center">
          <Database className="mr-2 h-4 w-4" />
          MongoDB Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="mqtt" className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md mb-6">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">About MQTT Configuration</h3>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            MQTT settings control how this device connects to your MQTT broker. These settings 
            should match your ESP32 firmware configuration for proper communication.
          </p>
        </div>

        <Form {...mqttForm}>
          <form onSubmit={mqttForm.handleSubmit(onMqttSubmit)} className="space-y-6">
            <FormField
              control={mqttForm.control}
              name="brokerUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MQTT Broker URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="mqtt://broker.example.com:1883" />
                  </FormControl>
                  <FormDescription>
                    The URL of your MQTT broker including protocol and port
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={mqttForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={mqttForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password (Optional)</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={mqttForm.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for this device on the MQTT network
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={mqttForm.control}
                name="qos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quality of Service (QoS)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select QoS level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">0 - At most once delivery</SelectItem>
                        <SelectItem value="1">1 - At least once delivery</SelectItem>
                        <SelectItem value="2">2 - Exactly once delivery</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Determines the guarantee of message delivery
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={mqttForm.control}
              name="topicPrefix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic Prefix</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Base topic for all device messages (e.g., devices/living-room)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex items-center justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => testConnection('mqtt')}
                disabled={isUpdating || testingConnection}
              >
                {testingConnection ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Test Connection
                  </>
                )}
              </Button>
              
              <Button 
                type="submit" 
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="mongodb" className="space-y-4">
        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-md mb-6">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">About MongoDB Configuration</h3>
          <p className="text-sm text-green-700 dark:text-green-400">
            MongoDB settings control how sensor data from this device is stored and retrieved. 
            Historical data will be saved according to these settings.
          </p>
        </div>

        <Form {...mongoForm}>
          <form onSubmit={mongoForm.handleSubmit(onMongoSubmit)} className="space-y-6">
            <FormField
              control={mongoForm.control}
              name="connectionString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection String</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="mongodb://username:password@host:port/database" />
                  </FormControl>
                  <FormDescription>
                    MongoDB connection string including authentication if required
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={mongoForm.control}
                name="database"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Database Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={mongoForm.control}
                name="collection"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collection Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Where sensor data will be stored
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={mongoForm.control}
              name="retentionDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Retention (Days)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="1" />
                  </FormControl>
                  <FormDescription>
                    Number of days to keep historical data before automatic cleanup
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2 py-2">
              <Switch id="auto-index" />
              <Label htmlFor="auto-index">Create automatic indexes for time-series queries</Label>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => testConnection('mongodb')}
                disabled={isUpdating || testingConnection}
              >
                {testingConnection ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Test Connection
                  </>
                )}
              </Button>
              
              <Button 
                type="submit" 
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
};

export default ConnectionSettings;
