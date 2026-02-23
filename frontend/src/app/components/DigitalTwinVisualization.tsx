import { Card } from "./ui/card";
import { Layers, ArrowRight, Brain, Cloud, Database } from "lucide-react";
import { motion } from "motion/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface DigitalTwinVisualizationProps {
  lastSync?: string | null;
}

export function DigitalTwinVisualization({ lastSync }: DigitalTwinVisualizationProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-lg">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Digital Twin System Architecture</h3>
          <p className="text-sm text-gray-600">Real-time synchronization visualization</p>
        </div>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-900 mb-2">
                <Layers className="w-5 h-5" />
                <span className="font-semibold">What is a Digital Twin?</span>
              </div>
              <p className="text-sm text-blue-800">
                This dashboard is a digital replica of your real irrigation system. It mirrors the physical pump, sensors,
                and field conditions in real-time, enabling remote monitoring and predictive maintenance.
              </p>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to learn more about Digital Twin technology</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Architecture Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
        {/* Physical System */}
        <motion.div
          className="bg-white border-2 border-green-300 rounded-lg p-6 text-center shadow-lg"
          animate={{
            boxShadow: [
              "0 4px 6px rgba(34, 197, 94, 0.1)",
              "0 8px 12px rgba(34, 197, 94, 0.3)",
              "0 4px 6px rgba(34, 197, 94, 0.1)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="text-5xl mb-3">🌾</div>
          <h4 className="font-bold text-gray-900 mb-2">Physical System</h4>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Water Pump</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>IoT Sensors</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span>Camera</span>
            </div>
          </div>
          <div className="mt-3 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
            Real Hardware
          </div>
        </motion.div>

        {/* Arrow 1 */}
        <div className="flex justify-center">
          <motion.div
            animate={{
              x: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ArrowRight className="w-8 h-8 text-blue-500" />
          </motion.div>
        </div>

        {/* Data Collection */}
        <motion.div
          className="bg-white border-2 border-blue-300 rounded-lg p-6 text-center shadow-lg"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <Database className="w-12 h-12 mx-auto mb-3 text-blue-600" />
          <h4 className="font-bold text-gray-900 mb-2">Data Stream</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div>ESP32 Controller</div>
            <div>WiFi/IoT Gateway</div>
            <div>Real-time Sync</div>
          </div>
          <div className="mt-3 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
            Communication
          </div>
        </motion.div>

        {/* Arrow 2 */}
        <div className="flex justify-center">
          <motion.div
            animate={{
              x: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <ArrowRight className="w-8 h-8 text-indigo-500" />
          </motion.div>
        </div>

        {/* Digital Twin Dashboard */}
        <motion.div
          className="bg-white border-2 border-indigo-300 rounded-lg p-6 text-center shadow-lg"
          animate={{
            boxShadow: [
              "0 4px 6px rgba(99, 102, 241, 0.1)",
              "0 8px 12px rgba(99, 102, 241, 0.3)",
              "0 4px 6px rgba(99, 102, 241, 0.1)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        >
          <div className="text-5xl mb-3">📊</div>
          <h4 className="font-bold text-gray-900 mb-2">Digital Twin</h4>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <Brain className="w-3 h-3 text-purple-600" />
              <span>AI Analysis</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Cloud className="w-3 h-3 text-blue-600" />
              <span>Cloud Dashboard</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Layers className="w-3 h-3 text-indigo-600" />
              <span>Virtual Model</span>
            </div>
          </div>
          <div className="mt-3 bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded">
            Software Mirror
          </div>
        </motion.div>
      </div>

      {/* Status Labels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="bg-green-50 border border-green-300 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              className="w-3 h-3 bg-green-500 rounded-full"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [1, 0.6, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
            <span className="font-bold text-green-900">Physical System Status</span>
          </div>
          <p className="text-sm text-green-700">Real irrigation pump operating in the field</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-300 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              className="w-3 h-3 bg-indigo-500 rounded-full"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [1, 0.6, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0.5,
              }}
            />
            <span className="font-bold text-indigo-900">Digital Twin Model</span>
          </div>
          <p className="text-sm text-indigo-700">Virtual dashboard synchronized in real-time</p>
        </div>
      </div>

      {/* Sync Status */}
      <motion.div
        className="mt-6 bg-gradient-to-r from-green-100 via-blue-100 to-indigo-100 border-2 border-blue-400 rounded-lg p-4 text-center"
        animate={{
          borderColor: ["#60a5fa", "#818cf8", "#60a5fa"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        <div className="flex items-center justify-center gap-2 text-blue-900">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Layers className="w-5 h-5" />
          </motion.div>
          <span className="font-bold">Real-Time Synchronization Active</span>
        </div>
        <p className="text-sm text-blue-700 mt-2">
          Dashboard updates every second with live data from the physical system
          {lastSync && (
            <span className="block mt-1 text-blue-600">Twin state (Backend 4) last sync: {new Date(lastSync).toLocaleString()}</span>
          )}
        </p>
      </motion.div>
    </Card>
  );
}
