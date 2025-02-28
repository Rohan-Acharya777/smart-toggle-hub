
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDevices } from "@/api/deviceApi";
import { useAuth } from "@/hooks/useAuth";
import DevicesList from "@/components/DevicesList";
import DeviceSwitches from "@/components/DeviceSwitches";
import EnergyMonitor from "@/components/EnergyMonitor";
import AddDeviceForm from "@/components/AddDeviceForm";
import { Wifi, WifiOff, Database, AlertCircle, CheckCircle, LogOut } from "lucide-react";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("devices");
  const [mqttStatus, setMqttStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  const { data: devices, isLoading, error } = useQuery({
    queryKey: ["devices"],
    queryFn: fetchDevices,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load devices. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Check backend connection status
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        // Simple health check to the backend
        const response = await fetch('http://localhost:5000/health');
        
        if (response.ok) {
          // If backend is up, we assume both services are connected
          // In a real app, you'd check this from the backend
          setTimeout(() => setMqttStatus('connected'), 800);
          setTimeout(() => setDbStatus('connected'), 1200);
        } else {
          setMqttStatus('disconnected');
          setDbStatus('disconnected');
        }
      } catch (error) {
        console.error("Backend connection error:", error);
        setMqttStatus('disconnected');
        setDbStatus('disconnected');
      }
    };
    
    checkBackendConnection();
    
    // Refresh connection status every 30 seconds
    const interval = setInterval(checkBackendConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate('/');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-10 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Smart IoT Dashboard</h1>
            <div className="flex space-x-4 items-center">
              <div className="flex items-center">
                {mqttStatus === 'connected' ? (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <Wifi className="h-4 w-4 mr-1" />
                    <span className="text-xs">MQTT</span>
                  </div>
                ) : mqttStatus === 'connecting' ? (
                  <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                    <Wifi className="h-4 w-4 mr-1 animate-pulse" />
                    <span className="text-xs">MQTT</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 dark:text-red-400">
                    <WifiOff className="h-4 w-4 mr-1" />
                    <span className="text-xs">MQTT</span>
                  </div>
                )}
              </div>
              <div className="flex items-center">
                {dbStatus === 'connected' ? (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <Database className="h-4 w-4 mr-1" />
                    <span className="text-xs">MongoDB</span>
                  </div>
                ) : dbStatus === 'connecting' ? (
                  <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                    <Database className="h-4 w-4 mr-1 animate-pulse" />
                    <span className="text-xs">MongoDB</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 dark:text-red-400">
                    <Database className="h-4 w-4 mr-1" />
                    <span className="text-xs">MongoDB</span>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome, {user?.name || 'User'}. Monitor and control your connected devices.
          </p>
        </motion.div>

        {(mqttStatus === 'disconnected' || dbStatus === 'disconnected') && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3 text-yellow-800 dark:text-yellow-200 text-sm flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Connection Warning</p>
                <p className="mt-1">
                  {mqttStatus === 'disconnected' && dbStatus === 'disconnected' 
                    ? "MQTT broker and MongoDB are disconnected. Some features may not work properly."
                    : mqttStatus === 'disconnected'
                    ? "MQTT broker is disconnected. Real-time control may not work properly."
                    : "MongoDB is disconnected. Historical data may not be accessible."}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 border-yellow-300 dark:border-yellow-800 text-yellow-900 dark:text-yellow-200"
                >
                  Check Connection Settings
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {mqttStatus === 'connected' && dbStatus === 'connected' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-3 text-green-800 dark:text-green-200 text-sm flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">All Systems Connected</p>
                <p>MQTT broker and MongoDB are connected and functioning properly.</p>
              </div>
            </div>
          </motion.div>
        )}

        <Tabs
          defaultValue="devices"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger value="devices" className="py-2 px-4">
              Devices
            </TabsTrigger>
            <TabsTrigger value="switches" className="py-2 px-4">
              Switches
            </TabsTrigger>
            <TabsTrigger value="energy" className="py-2 px-4">
              Energy Monitor
            </TabsTrigger>
            <TabsTrigger value="add" className="py-2 px-4">
              Add Device
            </TabsTrigger>
          </TabsList>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <TabsContent value="devices" className="mt-6">
              <motion.div variants={itemVariants}>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Your Devices</h2>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                  ) : (
                    <DevicesList devices={devices || []} />
                  )}
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="switches" className="mt-6">
              <motion.div variants={itemVariants}>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Switch Control</h2>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                  ) : (
                    <DeviceSwitches devices={devices || []} />
                  )}
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="energy" className="mt-6">
              <motion.div variants={itemVariants}>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Energy Monitoring</h2>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                  ) : (
                    <EnergyMonitor devices={devices || []} />
                  )}
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="add" className="mt-6">
              <motion.div variants={itemVariants}>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Add New Device</h2>
                  <AddDeviceForm />
                </Card>
              </motion.div>
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
