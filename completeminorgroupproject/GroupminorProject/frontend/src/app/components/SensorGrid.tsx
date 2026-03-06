import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SensorCardProps {
  icon: LucideIcon;
  name: string;
  value: number;
  unit: string;
  safeRange: [number, number];
  trendData: number[];
  status: "normal" | "warning" | "critical";
}

export function SensorCard({
  icon: Icon,
  name,
  value,
  unit,
  safeRange,
  trendData,
  status,
}: SensorCardProps) {
  const statusConfig = {
    normal: {
      bg: "bg-green-50",
      border: "border-green-300",
      text: "text-green-700",
      dot: "bg-green-500",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      text: "text-yellow-700",
      dot: "bg-yellow-500",
    },
    critical: {
      bg: "bg-red-50",
      border: "border-red-300",
      text: "text-red-700",
      dot: "bg-red-500",
    },
  };

  const config = statusConfig[status];
  const chartData = trendData.map((val, idx) => ({ value: val, index: idx }));

  return (
    <Card className={`p-4 ${config.bg} border-2 ${config.border} relative overflow-hidden`}>
      <motion.div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
        style={{ background: config.dot }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${config.text}`} />
            <span className="text-sm font-medium text-gray-700">{name}</span>
          </div>
          <motion.div
            className={`w-3 h-3 rounded-full ${config.dot}`}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.6, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
        </div>

        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <motion.span
              className={`text-3xl font-bold ${config.text}`}
              key={value}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {value.toFixed(1)}
            </motion.span>
            <span className="text-sm text-gray-600">{unit}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Safe: {safeRange[0]} - {safeRange[1]} {unit}
          </div>
        </div>

        {/* Mini Sparkline */}
        <div className="h-12 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={status === "normal" ? "#22c55e" : status === "warning" ? "#eab308" : "#ef4444"}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

interface SensorGridProps {
  sensors: Array<Omit<SensorCardProps, "icon"> & { iconName: string }>;
}

export function SensorGrid({ sensors }: SensorGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {sensors.map((sensor) => (
        <SensorCard key={sensor.name} icon={sensor.icon as LucideIcon} {...sensor} />
      ))}
    </div>
  );
}
