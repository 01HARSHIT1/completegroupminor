import { useState } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

interface HistoricalDataPoint {
  timestamp: string;
  current: number;
  temperature: number;
  vibration: number;
  flow: number;
  health: number; // 0-100 score
}

interface HistoricalAnalyticsProps {
  hourData: HistoricalDataPoint[];
  dayData: HistoricalDataPoint[];
  weekData: HistoricalDataPoint[];
  monthData: HistoricalDataPoint[];
}

export function HistoricalAnalytics({ hourData, dayData, weekData, monthData }: HistoricalAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h");

  const dataMap = {
    "1h": hourData,
    "24h": dayData,
    "7d": weekData,
    "30d": monthData,
  };

  const currentData = dataMap[timeRange];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-500 p-3 rounded-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Historical Analytics & Trends</h3>
          <p className="text-sm text-gray-600">Long-term system performance analysis</p>
        </div>
      </div>

      {/* Time Range Selector */}
      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="1h" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Last Hour
          </TabsTrigger>
          <TabsTrigger value="24h" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            24 Hours
          </TabsTrigger>
          <TabsTrigger value="7d" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            7 Days
          </TabsTrigger>
          <TabsTrigger value="30d" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            30 Days
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-8">
        {/* Current vs Time */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Current (A) vs Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="timestamp" stroke="#6b7280" style={{ fontSize: "12px" }} />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} dot={false} name="Current (A)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Temperature vs Time */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Temperature (°C) vs Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="timestamp" stroke="#6b7280" style={{ fontSize: "12px" }} />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={false} name="Temperature (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vibration vs Time */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Vibration Level vs Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="timestamp" stroke="#6b7280" style={{ fontSize: "12px" }} />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line type="monotone" dataKey="vibration" stroke="#f59e0b" strokeWidth={2} dot={false} name="Vibration" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Water Flow vs Time */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Water Flow (L/min) vs Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="timestamp" stroke="#6b7280" style={{ fontSize: "12px" }} />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line type="monotone" dataKey="flow" stroke="#06b6d4" strokeWidth={2} dot={false} name="Flow (L/min)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Health Status Over Time */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">System Health Score vs Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="timestamp" stroke="#6b7280" style={{ fontSize: "12px" }} />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={3} dot={false} name="Health Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Multi-Sensor Comparison */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Multi-Sensor Comparison (Normalized)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="timestamp" stroke="#6b7280" style={{ fontSize: "12px" }} />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} dot={false} name="Current" />
              <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={false} name="Temperature" />
              <Line type="monotone" dataKey="vibration" stroke="#f59e0b" strokeWidth={2} dot={false} name="Vibration" />
              <Line type="monotone" dataKey="flow" stroke="#06b6d4" strokeWidth={2} dot={false} name="Flow" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
