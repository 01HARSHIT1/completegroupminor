import { useState } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Zap, DollarSign, Clock } from "lucide-react";
import { motion } from "motion/react";

interface ElectricityData {
  timestamp: string;
  power: number;
  energy: number;
}

interface ElectricityPanelProps {
  currentPower: number;
  todayData: ElectricityData[];
  weekData: ElectricityData[];
  monthData: ElectricityData[];
  totalEnergyToday: number;
  totalEnergyWeek: number;
  totalEnergyMonth: number;
  motorOnTimeToday: string;
  motorOnTimeWeek: string;
  motorOnTimeMonth: string;
  estimatedCostMonth: number;
}

export function ElectricityPanel({
  currentPower,
  todayData,
  weekData,
  monthData,
  totalEnergyToday,
  totalEnergyWeek,
  totalEnergyMonth,
  motorOnTimeToday,
  motorOnTimeWeek,
  motorOnTimeMonth,
  estimatedCostMonth,
}: ElectricityPanelProps) {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("today");

  const dataMap = {
    today: { data: todayData, energy: totalEnergyToday, runtime: motorOnTimeToday },
    week: { data: weekData, energy: totalEnergyWeek, runtime: motorOnTimeWeek },
    month: { data: monthData, energy: totalEnergyMonth, runtime: motorOnTimeMonth },
  };

  const currentData = dataMap[timeRange];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-500 p-3 rounded-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Electricity Consumption</h3>
          <p className="text-sm text-gray-600">Real-time power monitoring</p>
        </div>
      </div>

      {/* Live Power and Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium">Live Power</span>
          </div>
          <div className="text-3xl font-bold">{currentPower}</div>
          <div className="text-sm opacity-90">Watts</div>
        </motion.div>

        <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Total Energy</span>
          </div>
          <div className="text-2xl font-bold text-green-700">{currentData.energy.toFixed(2)}</div>
          <div className="text-sm text-green-600">kWh</div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Runtime</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">{currentData.runtime}</div>
          <div className="text-sm text-purple-600">Hours</div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Est. Cost</span>
          </div>
          <div className="text-2xl font-bold text-yellow-700">₹{estimatedCostMonth.toFixed(0)}</div>
          <div className="text-sm text-yellow-600">This Month</div>
        </div>
      </div>

      {/* Time Range Selector */}
      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)} className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Power Consumption Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Power Consumption Over Time</h4>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={currentData.data}>
            <defs>
              <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="timestamp" stroke="#6b7280" style={{ fontSize: "12px" }} />
            <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} label={{ value: "Power (W)", angle: -90, position: "insideLeft" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Area type="monotone" dataKey="power" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPower)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Energy Consumption Chart */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Cumulative Energy Consumption</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={currentData.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="timestamp" stroke="#6b7280" style={{ fontSize: "12px" }} />
            <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} label={{ value: "Energy (kWh)", angle: -90, position: "insideLeft" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
