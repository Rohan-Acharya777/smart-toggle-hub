
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDevice } from "@/api/deviceApi";
import { PlusCircle, MinusCircle, Save } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Device name must be at least 2 characters.",
  }),
  location: z.string().optional(),
  description: z.string().optional(),
  macAddress: z.string().min(12, {
    message: "MAC address must be a valid format (e.g., AABBCCDDEEFF).",
  }).max(17).regex(/^([0-9A-Fa-f]{2}[:-]?){5}([0-9A-Fa-f]{2})$/, {
    message: "MAC address must be a valid format.",
  }),
});

const AddDeviceForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [switchCount, setSwitchCount] = useState(4); // Default to 4 switches
  const [switchNames, setSwitchNames] = useState<string[]>(Array(4).fill(""));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      description: "",
      macAddress: "",
    },
  });

  const createDeviceMutation = useMutation({
    mutationFn: createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast({
        title: "Success",
        description: "Device created successfully",
      });
      // Reset form
      form.reset();
      setSwitchNames(Array(switchCount).fill(""));
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create device",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const switches = Array.from({ length: switchCount }, (_, i) => ({
      name: switchNames[i] || `Switch ${i + 1}`,
      state: false,
    }));

    const deviceData = {
      ...values,
      switches,
    };

    createDeviceMutation.mutate(deviceData);
  };

  const handleSwitchNameChange = (index: number, value: string) => {
    const newNames = [...switchNames];
    newNames[index] = value;
    setSwitchNames(newNames);
  };

  const handleAddSwitch = () => {
    if (switchCount < 8) {
      setSwitchCount(switchCount + 1);
      setSwitchNames([...switchNames, ""]);
    }
  };

  const handleRemoveSwitch = () => {
    if (switchCount > 1) {
      setSwitchCount(switchCount - 1);
      setSwitchNames(switchNames.slice(0, -1));
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
                <Input placeholder="My Smart Device" {...field} />
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
                <FormLabel>Location (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Living Room" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="macAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MAC Address</FormLabel>
                <FormControl>
                  <Input placeholder="AA:BB:CC:DD:EE:FF" {...field} />
                </FormControl>
                <FormDescription>
                  Physical address of your ESP32 device
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="A short description of this device" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <div className="flex justify-between items-center mb-4">
            <FormLabel>Device Switches</FormLabel>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveSwitch}
                disabled={switchCount <= 1}
              >
                <MinusCircle className="h-4 w-4 mr-1" />
                Remove
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSwitch}
                disabled={switchCount >= 8}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {Array.from({ length: switchCount }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <div className="bg-gray-100 dark:bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-medium">
                  {index + 1}
                </div>
                <Input
                  placeholder={`Switch ${index + 1} name`}
                  value={switchNames[index]}
                  onChange={(e) => handleSwitchNameChange(index, e.target.value)}
                  className="flex-1"
                />
              </motion.div>
            ))}
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={createDeviceMutation.isPending}
        >
          {createDeviceMutation.isPending ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Create Device
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AddDeviceForm;
