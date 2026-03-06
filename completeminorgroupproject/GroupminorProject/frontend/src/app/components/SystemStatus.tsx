import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Cpu, Wifi, Camera, Activity, Info } from "lucide-react";
import { motion } from "motion/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface SystemStatusProps {
  esp32Connected: boolean;
  wifiSignalStrength: number; // 0-100
  lastDataReceived: Date;
  cameraOnline: boolean;
  sensorHealth: {
    current: boolean;
    temperature: boolean;
    vibration: boolean;
    flow: boolean;
    voltage: boolean;
  };
  firmwareVersion: string;
}

export function SystemStatus({
  esp32Connected,
  wifiSignalStrength,
  lastDataReceived,
  cameraOnline,
  sensorHealth,
  firmwareVersion,
}: SystemStatusProps) {
  const getSignalStrengthLabel = (strength: number) => {
    if (strength >= 75) return { label: "Excellent", color: "text-green-600" };
    if (strength >= 50) return { label: "Good", color: "text-blue-600" };
    if (strength >= 25) return { label: "Fair", color: "text-yellow-600" };
    return { label: "Poor", color: "text-red-600" };
  };

  const signalInfo = getSignalStrengthLabel(wifiSignalStrength);

  const healthySensors = Object.values(sensorHealth).filter(Boolean).length;
  const totalSensors = Object.keys(sensorHealth).length;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gray-700 p-3 rounded-lg">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">System Status & Device Info</h3>
          <p className="text-sm text-gray-600">Hardware connectivity and health</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ESP32 Connection Status */}
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-gray-700" />
              <span className="font-semibold text-gray-900">ESP32 Controller</span>
            </div>
            {esp32Connected ? (
              <Badge className="bg-green-500 text-white">
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Connected
                </motion.span>
              </Badge>
            ) : (
              <Badge className="bg-red-500 text-white">Disconnected</Badge>
            )}
          </div>
          <div className="text-xs text-gray-600">
            Last data received: {lastDataReceived.toLocaleTimeString()}
          </div>
        </div>

        {/* WiFi Signal Strength */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-700" />
              <span className="font-semibold text-gray-900">WiFi Signal</span>
            </div>
            <Badge className={`${signalInfo.color === "text-green-600" ? "bg-green-500" : signalInfo.color === "text-blue-600" ? "bg-blue-500" : signalInfo.color === "text-yellow-600" ? "bg-yellow-500" : "bg-red-500"} text-white`}>
              {signalInfo.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full ${
                  wifiSignalStrength >= 75
                    ? "bg-green-500"
                    : wifiSignalStrength >= 50
                    ? "bg-blue-500"
                    : wifiSignalStrength >= 25
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${wifiSignalStrength}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <span className="text-sm font-bold text-gray-700">{wifiSignalStrength}%</span>
          </div>
        </div>

        {/* Camera Status */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-700" />
              <span className="font-semibold text-gray-900">Camera Feed</span>
            </div>
            {cameraOnline ? (
              <Badge className="bg-green-500 text-white">
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Online
                </motion.span>
              </Badge>
            ) : (
              <Badge className="bg-red-500 text-white">Offline</Badge>
            )}
          </div>
          <div className="text-xs text-gray-600">
            Status: {cameraOnline ? "Streaming" : "Unavailable"}
          </div>
        </div>

        {/* Sensor Health Summary */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-700" />
              <span className="font-semibold text-gray-900">Sensor Health</span>
            </div>
            <Badge className={healthySensors === totalSensors ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
              {healthySensors}/{totalSensors} Healthy
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(sensorHealth).map(([sensor, healthy]) => (
              <div key={sensor} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${healthy ? "bg-green-500" : "bg-red-500"}`} />
                <span className="capitalize text-gray-700">{sensor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Firmware Version */}
      <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-5 h-5 text-indigo-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Current system firmware version running on ESP32</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="font-semibold text-gray-900">Firmware Version</span>
          </div>
          <Badge variant="outline" className="bg-white border-indigo-300 text-indigo-700 font-mono">
            v{firmwareVersion}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
