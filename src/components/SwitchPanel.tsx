
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Device } from "@/types/device";
import { Power } from "lucide-react";

interface SwitchPanelProps {
  device: Device;
  onUpdate: (data: any) => void;
}

const SwitchPanel = ({ device, onUpdate }: SwitchPanelProps) => {
  const [switchStates, setSwitchStates] = useState<boolean[]>(
    device.switches.map((sw) => sw.state)
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSwitchToggle = (index: number) => {
    const newStates = [...switchStates];
    newStates[index] = !newStates[index];
    setSwitchStates(newStates);
  };

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    
    const updatedSwitches = device.switches.map((sw, index) => ({
      ...sw,
      state: switchStates[index],
    }));
    
    const updatedDevice = {
      ...device,
      switches: updatedSwitches,
    };
    
    try {
      await onUpdate({
        id: device._id,
        deviceData: updatedDevice,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAllOn = () => {
    setSwitchStates(device.switches.map(() => true));
  };

  const handleAllOff = () => {
    setSwitchStates(device.switches.map(() => false));
  };

  const hasChanges = device.switches.some((sw, index) => sw.state !== switchStates[index]);

  return (
    <div>
      <div className="flex justify-end mb-4 space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAllOff}
          disabled={isUpdating || switchStates.every((state) => !state)}
        >
          All Off
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAllOn}
          disabled={isUpdating || switchStates.every((state) => state)}
        >
          All On
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {device.switches.map((sw, index) => (
          <motion.div
            key={sw.id}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className={`bg-white dark:bg-gray-800 p-4 rounded-lg border ${
              switchStates[index]
                ? "border-green-200 dark:border-green-900"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`mr-4 p-2 rounded-full ${
                    switchStates[index]
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                  }`}
                >
                  <Power className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {sw.name || `Switch ${index + 1}`}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {switchStates[index] ? "ON" : "OFF"}
                  </p>
                </div>
              </div>
              <Switch
                checked={switchStates[index]}
                onCheckedChange={() => handleSwitchToggle(index)}
                disabled={isUpdating}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mt-6 flex justify-end"
          >
            <Button onClick={handleSaveChanges} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwitchPanel;
