
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ToggleLeft, 
  ToggleRight, 
  Activity, 
  Zap, 
  MoreVertical,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Device } from "@/types/device";

interface DevicesListProps {
  devices: Device[];
}

const DevicesList = ({ devices }: DevicesListProps) => {
  const navigate = useNavigate();
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);

  if (devices.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400 mb-4">No devices found</p>
        <Button onClick={() => navigate("/dashboard?tab=add")} size="sm">
          Add a Device
        </Button>
      </div>
    );
  }

  const toggleExpand = (deviceId: string) => {
    setExpandedDevice(expandedDevice === deviceId ? null : deviceId);
  };

  return (
    <div className="space-y-4">
      {devices.map((device, index) => (
        <motion.div
          key={device._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          <div 
            className="p-4 flex items-center justify-between cursor-pointer"
            onClick={() => toggleExpand(device._id)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  device.isOnline 
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}>
                  {device.isOnline ? <ToggleRight /> : <ToggleLeft />}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{device.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {device.isOnline ? "Online" : "Offline"} • Last update {formatDistanceToNow(new Date(device.lastUpdate), { addSuffix: true })}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                expandedDevice === device._id ? "transform rotate-90" : ""
              }`} />
            </div>
          </div>

          {expandedDevice === device._id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4 pb-4"
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <Activity className="h-4 w-4 mr-1" /> Current
                  </div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {device.sensorData.current.toFixed(2)} A
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <Zap className="h-4 w-4 mr-1" /> Voltage
                  </div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {device.sensorData.voltage.toFixed(1)} V
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {device.switches.filter(s => s.state).length} of {device.switches.length} switches on
                </div>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/device/${device._id}`);
                  }}
                >
                  View Details
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default DevicesList;
