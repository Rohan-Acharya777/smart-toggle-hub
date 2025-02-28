
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDeviceById, updateDevice, deleteDevice } from "@/api/deviceApi";
import SwitchPanel from "@/components/SwitchPanel";
import PowerGraph from "@/components/PowerGraph";
import DeviceSettings from "@/components/DeviceSettings";
import { ArrowLeft, Trash2 } from "lucide-react";

const DeviceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("control");

  const { data: device, isLoading, error } = useQuery({
    queryKey: ["device", id],
    queryFn: () => fetchDeviceById(id || ""),
    enabled: !!id,
  });

  const updateDeviceMutation = useMutation({
    mutationFn: updateDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["device", id] });
      toast({
        title: "Success",
        description: "Device updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update device",
        variant: "destructive",
      });
    },
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Device deleted successfully",
      });
      navigate("/dashboard");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete device",
        variant: "destructive",
      });
    },
  });

  const handleDeleteDevice = () => {
    if (window.confirm("Are you sure you want to delete this device?")) {
      deleteDeviceMutation.mutate(id || "");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            Failed to load device information. Please try again or go back to the dashboard.
          </AlertDescription>
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard")}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-10 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex items-center"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{device.name}</h1>
            <p className="text-gray-600 dark:text-gray-300">ID: {device._id}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteDevice}
            className="ml-auto text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </motion.div>

        <Tabs
          defaultValue="control"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger value="control" className="py-2 px-4">
              Control
            </TabsTrigger>
            <TabsTrigger value="analytics" className="py-2 px-4">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="py-2 px-4">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Switch Control</CardTitle>
                </CardHeader>
                <CardContent>
                  <SwitchPanel device={device} onUpdate={updateDeviceMutation.mutate} />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Power Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <PowerGraph deviceId={device._id} />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Device Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <DeviceSettings 
                    device={device} 
                    onUpdate={(updatedDevice) => 
                      updateDeviceMutation.mutate({ 
                        id: device._id, 
                        deviceData: updatedDevice 
                      })
                    } 
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeviceDetail;
