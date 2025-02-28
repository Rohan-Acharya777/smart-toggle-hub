
import { useState } from "react";
import { motion } from "framer-motion";
import { Device } from "@/types/device";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDeviceSwitch } from "@/api/deviceApi";
import { Power } from "lucide-react";

interface DeviceSwitchesProps {
  devices: Device[];
}

const DeviceSwitches = ({ devices }: DeviceSwitchesProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDevice, setSelectedDevice] = useState<string>(devices[0]?._id || "");
  
  const device = devices.find(d => d._id === selectedDevice);
  
  const updateSwitchMutation = useMutation({
    mutationFn: updateDeviceSwitch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast({
        title: "Success",
        description: "Switch state updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update switch state",
        variant: "destructive",
      });
    },
  });

  const handleSwitchToggle = (switchId: string, newState: boolean) => {
    if (!selectedDevice) return;
    
    updateSwitchMutation.mutate({
      deviceId: selectedDevice,
      switchId,
      state: newState,
    });
  };

  if (devices.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">No devices available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Label htmlFor="device-select" className="mb-2 block text-sm font-medium">
          Select Device
        </Label>
        <Select 
          value={selectedDevice} 
          onValueChange={setSelectedDevice}
        >
          <SelectTrigger id="device-select" className="w-full">
            <SelectValue placeholder="Select a device" />
          </SelectTrigger>
          <SelectContent>
            {devices.map(device => (
              <SelectItem key={device._id} value={device._id}>
                {device.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {device ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {device.switches.map((sw, index) => (
              <motion.div
                key={sw.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className={`p-4 border ${sw.state ? 'border-green-200 dark:border-green-900' : 'border-gray-200 dark:border-gray-700'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor={`switch-${sw.id}`} className="font-medium">
                        {sw.name || `Switch ${index + 1}`}
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {sw.state ? "ON" : "OFF"}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className={`mr-3 p-1.5 rounded-full ${
                        sw.state 
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                      }`}>
                        <Power className="h-5 w-5" />
                      </div>
                      <Switch
                        id={`switch-${sw.id}`}
                        checked={sw.state}
                        onCheckedChange={(checked) => handleSwitchToggle(sw.id, checked)}
                        disabled={updateSwitchMutation.isPending}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                device.switches.forEach(sw => {
                  if (sw.state) {
                    handleSwitchToggle(sw.id, false);
                  }
                });
              }}
              disabled={!device.switches.some(sw => sw.state) || updateSwitchMutation.isPending}
            >
              Turn All Off
            </Button>
            <Button
              variant="default"
              onClick={() => {
                device.switches.forEach(sw => {
                  if (!sw.state) {
                    handleSwitchToggle(sw.id, true);
                  }
                });
              }}
              disabled={device.switches.every(sw => sw.state) || updateSwitchMutation.isPending}
            >
              Turn All On
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400">Select a device to control switches</p>
        </div>
      )}
    </div>
  );
};

export default DeviceSwitches;
