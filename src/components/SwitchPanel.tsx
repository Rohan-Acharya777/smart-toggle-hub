
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Device, SwitchData } from "@/types/device";
import { Power, Lightbulb, Fan, Tv, Radio, Coffee, Smartphone, Monitor, Wifi } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface SwitchPanelProps {
  device: Device;
  onUpdate: (data: any) => void;
}

const iconOptions = [
  { value: "power", label: "Power", icon: Power },
  { value: "light", label: "Light", icon: Lightbulb },
  { value: "fan", label: "Fan", icon: Fan },
  { value: "tv", label: "TV", icon: Tv },
  { value: "radio", label: "Radio", icon: Radio },
  { value: "coffee", label: "Coffee", icon: Coffee },
  { value: "phone", label: "Phone", icon: Smartphone },
  { value: "monitor", label: "Monitor", icon: Monitor },
  { value: "wifi", label: "WiFi", icon: Wifi },
];

const colorOptions = [
  { value: "green", label: "Green", bgClass: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  { value: "blue", label: "Blue", bgClass: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "red", label: "Red", bgClass: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  { value: "yellow", label: "Yellow", bgClass: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { value: "purple", label: "Purple", bgClass: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  { value: "indigo", label: "Indigo", bgClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" },
  { value: "pink", label: "Pink", bgClass: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
  { value: "gray", label: "Gray", bgClass: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400" },
];

const SwitchPanel = ({ device, onUpdate }: SwitchPanelProps) => {
  const { toast } = useToast();
  const [switchStates, setSwitchStates] = useState<boolean[]>(
    device.switches.map((sw) => sw.state)
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedSwitches, setEditedSwitches] = useState<SwitchData[]>(
    device.switches.map(sw => ({
      ...sw,
      icon: sw.icon || "power",
      color: sw.color || "green"
    }))
  );

  const handleSwitchToggle = (index: number) => {
    if (editMode) return;
    
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
      toast({
        title: "Success",
        description: "Switch states updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update switch states",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveCustomization = async () => {
    setIsUpdating(true);
    
    const updatedDevice = {
      ...device,
      switches: editedSwitches.map((sw, index) => ({
        ...sw,
        state: switchStates[index],
      })),
    };
    
    try {
      await onUpdate({
        id: device._id,
        deviceData: updatedDevice,
      });
      toast({
        title: "Success",
        description: "Switch customization saved successfully",
      });
      setEditMode(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save switch customization",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditSwitchName = (index: number, name: string) => {
    const newSwitches = [...editedSwitches];
    newSwitches[index] = {
      ...newSwitches[index],
      name,
    };
    setEditedSwitches(newSwitches);
  };

  const handleEditSwitchIcon = (index: number, icon: string) => {
    const newSwitches = [...editedSwitches];
    newSwitches[index] = {
      ...newSwitches[index],
      icon,
    };
    setEditedSwitches(newSwitches);
  };

  const handleEditSwitchColor = (index: number, color: string) => {
    const newSwitches = [...editedSwitches];
    newSwitches[index] = {
      ...newSwitches[index],
      color,
    };
    setEditedSwitches(newSwitches);
  };

  const handleAllOn = () => {
    if (editMode) return;
    setSwitchStates(device.switches.map(() => true));
  };

  const handleAllOff = () => {
    if (editMode) return;
    setSwitchStates(device.switches.map(() => false));
  };

  const getIconComponent = (iconName: string) => {
    const found = iconOptions.find(icon => icon.value === iconName);
    const IconComponent = found ? found.icon : Power;
    return IconComponent;
  };

  const getColorClass = (colorName: string) => {
    const found = colorOptions.find(color => color.value === colorName);
    return found ? found.bgClass : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
  };

  const hasChanges = !editMode && device.switches.some((sw, index) => sw.state !== switchStates[index]);
  const hasCustomizationChanges = editMode && JSON.stringify(device.switches) !== JSON.stringify(editedSwitches);

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAllOff}
            disabled={isUpdating || editMode || switchStates.every((state) => !state)}
          >
            All Off
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAllOn}
            disabled={isUpdating || editMode || switchStates.every((state) => state)}
          >
            All On
          </Button>
        </div>
        <Button
          variant={editMode ? "default" : "outline"}
          size="sm"
          onClick={() => setEditMode(!editMode)}
          disabled={isUpdating}
        >
          {editMode ? "Exit Customization" : "Customize Switches"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {editMode ? (
          // Edit mode for customizing switches
          editedSwitches.map((sw, index) => (
            <motion.div
              key={sw.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-full ${getColorClass(sw.color || "green")}`}>
                    {(() => {
                      const IconComponent = getIconComponent(sw.icon || "power");
                      return <IconComponent size={20} />;
                    })()}
                  </div>
                  <div className="font-medium">Switch {index + 1}</div>
                </div>
                
                <div>
                  <Label htmlFor={`name-${sw.id}`} className="mb-1 block text-xs">Name</Label>
                  <Input
                    id={`name-${sw.id}`}
                    value={sw.name}
                    onChange={(e) => handleEditSwitchName(index, e.target.value)}
                    className="text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`icon-${sw.id}`} className="mb-1 block text-xs">Icon</Label>
                    <Select
                      value={sw.icon || "power"}
                      onValueChange={(value) => handleEditSwitchIcon(index, value)}
                    >
                      <SelectTrigger id={`icon-${sw.id}`} className="text-sm">
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map(icon => (
                          <SelectItem key={icon.value} value={icon.value}>
                            <div className="flex items-center">
                              {(() => {
                                const IconComp = icon.icon;
                                return <IconComp className="mr-2" size={16} />;
                              })()}
                              {icon.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor={`color-${sw.id}`} className="mb-1 block text-xs">Color</Label>
                    <Select
                      value={sw.color || "green"}
                      onValueChange={(value) => handleEditSwitchColor(index, value)}
                    >
                      <SelectTrigger id={`color-${sw.id}`} className="text-sm">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map(color => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full mr-2 ${color.bgClass}`}></div>
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          // Normal mode for controlling switches
          device.switches.map((sw, index) => {
            const IconComponent = getIconComponent(sw.icon || "power");
            const colorClass = getColorClass(sw.color || "green");
            
            return (
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
                        switchStates[index] ? colorClass : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                      }`}
                    >
                      <IconComponent className="h-6 w-6" />
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
            );
          })
        )}
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
        
        {hasCustomizationChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mt-6 flex justify-end"
          >
            <Button onClick={handleSaveCustomization} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Customization"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwitchPanel;
