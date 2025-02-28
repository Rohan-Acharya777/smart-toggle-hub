import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Device } from "@/types/device";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface DeviceSettingsProps {
  device: Device;
  onUpdate: (updatedDevice: Partial<Device>) => void;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Device name must be at least 2 characters.",
  }),
  location: z.string().optional(),
  description: z.string().optional(),
  mqttTopic: z.string().optional(),
});

const DeviceSettings = ({ device, onUpdate }: DeviceSettingsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: device.name,
      location: device.location || "",
      description: device.description || "",
      mqttTopic: device.mqttTopic || `device/${device._id}`,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsUpdating(true);
    
    try {
      await onUpdate(values);
      // Form doesn't need to be reset as we keep the current values
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Device Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Where is this device located?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mqttTopic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MQTT Topic</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Topic used for MQTT communication
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                A short description of this device's purpose
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-4">Device Information</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Device ID</p>
              <p className="font-mono text-sm">{device._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">MAC Address</p>
              <p className="font-mono text-sm">{device.macAddress}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Online</p>
            <p className="text-sm">{new Date(device.lastUpdate).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Switch Configuration</p>
            <p className="text-sm">{device.switches.length} switches configured</p>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default DeviceSettings;
