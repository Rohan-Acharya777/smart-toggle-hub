
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchDevices } from "@/api/deviceApi";
import DevicesList from "@/components/DevicesList";
import DeviceSwitches from "@/components/DeviceSwitches";
import EnergyMonitor from "@/components/EnergyMonitor";
import AddDeviceForm from "@/components/AddDeviceForm";

const Dashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("devices");

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
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Smart IoT Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor and control your connected devices
          </p>
        </motion.div>

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
