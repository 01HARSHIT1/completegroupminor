import { motion } from "motion/react";
import { Activity, CheckCircle, AlertTriangle, XCircle, Wifi, WifiOff } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface SystemHealthOverviewProps {
  healthStatus: "healthy" | "alert" | "fault";
  aiPrediction: string;
  reason: string;
  lastUpdated: Date;
  isOnline: boolean;
}

export function SystemHealthOverview({
  healthStatus,
  aiPrediction,
  reason,
  lastUpdated,
  isOnline,
}: SystemHealthOverviewProps) {
  const statusConfig = {
    healthy: {
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      label: "Healthy",
      borderColor: "border-green-500",
    },
    alert: {
      icon: AlertTriangle,
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
      label: "Alert",
      borderColor: "border-yellow-500",
    },
    fault: {
      icon: XCircle,
      color: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
      label: "Fault",
      borderColor: "border-red-500",
    },
  };

  const config = statusConfig[healthStatus];
  const StatusIcon = config.icon;

  return (
    <Card className="p-6 border-2 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Health Status Badge */}
        <div className="flex items-center gap-6">
          <motion.div
            className={`relative ${config.color} rounded-full p-6`}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <StatusIcon className="w-12 h-12 text-white" />
            <motion.div
              className={`absolute inset-0 ${config.color} rounded-full opacity-30`}
              animate={{
                scale: [1, 1.4],
                opacity: [0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold">System Health</h2>
              <Badge
                className={`${config.color} ${config.textColor} text-lg px-4 py-1`}
                variant="secondary"
              >
                {config.label}
              </Badge>
            </div>
            <div className={`${config.bgColor} ${config.textColor} px-4 py-2 rounded-lg mb-2`}>
              <p className="font-semibold">AI Prediction: {aiPrediction}</p>
            </div>
            <p className="text-gray-600 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {reason}
            </p>
          </div>
        </div>

        {/* Digital Twin Concept Visualization */}
        <div className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Digital Twin System</p>
            <div className="flex items-center gap-2">
              <motion.div
                className="bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🌾 Physical Pump
              </motion.div>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="text-blue-500 text-xl">↔</span>
              </motion.div>
              <motion.div
                className="bg-indigo-500 text-white px-3 py-2 rounded text-sm font-medium"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                📊 Dashboard
              </motion.div>
            </div>
          </div>

          {/* System Status */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700 font-medium">Offline</span>
                </>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
