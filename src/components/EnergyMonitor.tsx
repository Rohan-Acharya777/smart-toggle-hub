
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { fetchDeviceHistory } from "@/api/deviceApi";
import { Device } from "@/types/device";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Zap, Activity, Gauge, Clock } from "lucide-react";

interface EnergyMonitorProps {
  devices: Device[];
}

const EnergyMonitor = ({ devices }: EnergyMonitorProps) => {
  const [selectedDevice, setSelectedDevice] = useState<string>(devices[0]?._id || "");
  const [timeRange, setTimeRange] = useState<string>("day");
  
  const device = devices.find(d => d._id === selectedDevice);

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["deviceHistory", selectedDevice, timeRange],
    queryFn: () => fetchDeviceHistory(selectedDevice, timeRange),
    enabled: !!selectedDevice,
  });

  const calculatePower = (voltage: number, current: number) => {
    return voltage * current;
  };

  const calculateEnergy = (powerData: any[]) => {
    if (!powerData || powerData.length === 0) return 0;
    
    // Simple calculation: average power × time period
    const avgPower = powerData.reduce((sum, item) => sum + item.power, 0) / powerData.length;
    let hours = 1; // Default to 1 hour
    
    if (timeRange === "day") hours = 24;
    if (timeRange === "week") hours = 168;
    if (timeRange === "month") hours = 720;
    
    return avgPower * hours / 1000; // kWh
  };

  const processedData = historyData?.map(item => ({
    ...item,
    power: calculatePower(item.voltage, item.current)
  }));

  const energy = calculateEnergy(processedData);

  const formatTimeLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    if (timeRange === "day") {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
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
        
        <div>
          <Label htmlFor="time-range" className="mb-2 block text-sm font-medium">
            Time Range
          </Label>
          <Select 
            value={timeRange} 
            onValueChange={setTimeRange}
          >
            <SelectTrigger id="time-range" className="w-full">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {device ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current</p>
                  <h3 className="text-2xl font-bold">{device.sensorData.current.toFixed(2)} A</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full text-yellow-600 dark:text-yellow-400">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Voltage</p>
                  <h3 className="text-2xl font-bold">{device.sensorData.voltage.toFixed(1)} V</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600 dark:text-green-400">
                  <Gauge className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Power</p>
                  <h3 className="text-2xl font-bold">
                    {(device.sensorData.voltage * device.sensorData.current).toFixed(1)} W
                  </h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-purple-600 dark:text-purple-400">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Energy</p>
                  <h3 className="text-2xl font-bold">{energy.toFixed(2)} kWh</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="power" className="mt-6">
            <TabsList>
              <TabsTrigger value="power">Power</TabsTrigger>
              <TabsTrigger value="voltage">Voltage</TabsTrigger>
              <TabsTrigger value="current">Current</TabsTrigger>
            </TabsList>
            
            <TabsContent value="power" className="mt-4">
              <Card>
                <CardContent className="p-4 pt-6 h-80">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                  ) : processedData && processedData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={processedData}>
                        <defs>
                          <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={formatTimeLabel}
                          stroke="#888888"
                        />
                        <YAxis 
                          unit=" W" 
                          stroke="#888888"
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value.toFixed(2)} W`, 'Power']}
                          labelFormatter={(label) => new Date(label).toLocaleString()}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="power" 
                          stroke="#10B981" 
                          fillOpacity={1} 
                          fill="url(#colorPower)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      No data available for the selected time range
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="voltage" className="mt-4">
              <Card>
                <CardContent className="p-4 pt-6 h-80">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                  ) : historyData && historyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historyData}>
                        <defs>
                          <linearGradient id="colorVoltage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EAB308" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={formatTimeLabel}
                          stroke="#888888"
                        />
                        <YAxis 
                          unit=" V" 
                          stroke="#888888"
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value.toFixed(1)} V`, 'Voltage']}
                          labelFormatter={(label) => new Date(label).toLocaleString()}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="voltage" 
                          stroke="#EAB308" 
                          fillOpacity={1} 
                          fill="url(#colorVoltage)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      No data available for the selected time range
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="current" className="mt-4">
              <Card>
                <CardContent className="p-4 pt-6 h-80">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                  ) : historyData && historyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historyData}>
                        <defs>
                          <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={formatTimeLabel}
                          stroke="#888888"
                        />
                        <YAxis 
                          unit=" A" 
                          stroke="#888888"
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value.toFixed(2)} A`, 'Current']}
                          labelFormatter={(label) => new Date(label).toLocaleString()}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="current" 
                          stroke="#3B82F6" 
                          fillOpacity={1} 
                          fill="url(#colorCurrent)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      No data available for the selected time range
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400">Select a device to view energy data</p>
        </div>
      )}
    </div>
  );
};

export default EnergyMonitor;
