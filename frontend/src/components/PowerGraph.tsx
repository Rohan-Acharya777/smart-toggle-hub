
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchDeviceHistory } from "@/api/deviceApi";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface PowerGraphProps {
  deviceId: string;
}

const PowerGraph = ({ deviceId }: PowerGraphProps) => {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("day");

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["deviceHistory", deviceId, timeRange],
    queryFn: () => fetchDeviceHistory(deviceId, timeRange),
  });

  const processedData = historyData?.map(item => ({
    ...item,
    power: item.voltage * item.current,
    timestamp: new Date(item.timestamp).getTime(),
  }));

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    
    if (timeRange === "day") {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === "week") {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4 space-x-2">
        <Button
          variant={timeRange === "day" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange("day")}
        >
          Day
        </Button>
        <Button
          variant={timeRange === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange("week")}
        >
          Week
        </Button>
        <Button
          variant={timeRange === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange("month")}
        >
          Month
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 pt-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-[80px]" />
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Power</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {processedData && processedData.length > 0
                    ? (processedData.reduce((sum, item) => sum + item.power, 0) / processedData.length).toFixed(1)
                    : "0.0"} W
                </h3>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 pt-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-[80px]" />
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400">Peak Power</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {processedData && processedData.length > 0
                    ? Math.max(...processedData.map(item => item.power)).toFixed(1)
                    : "0.0"} W
                </h3>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 pt-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-[80px]" />
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Energy</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {processedData && processedData.length > 0
                    ? ((processedData.reduce((sum, item) => sum + item.power, 0) / processedData.length) * 
                        (timeRange === "day" ? 24 : timeRange === "week" ? 168 : 720) / 1000).toFixed(2)
                    : "0.00"} kWh
                </h3>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 pt-6 h-96">
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
                  tickFormatter={formatDate}
                  stroke="#888888"
                  domain={['dataMin', 'dataMax']}
                  type="number"
                />
                <YAxis 
                  stroke="#888888"
                  label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: any) => [`${Number(value).toFixed(2)} W`, 'Power']}
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
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">No data available for the selected time range</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PowerGraph;
