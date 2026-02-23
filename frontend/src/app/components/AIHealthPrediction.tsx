import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Brain, TrendingUp, Wrench, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { Progress } from "./ui/progress";

interface PredictionHistory {
  timestamp: string;
  status: "healthy" | "alert" | "fault";
  confidence: number;
}

interface AIHealthPredictionProps {
  currentStatus: "healthy" | "alert" | "fault";
  confidence: number;
  rootCause: string[];
  maintenanceActions: string[];
  predictionHistory: PredictionHistory[];
}

export function AIHealthPrediction({
  currentStatus,
  confidence,
  rootCause,
  maintenanceActions,
  predictionHistory,
}: AIHealthPredictionProps) {
  const statusConfig = {
    healthy: {
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
      label: "Healthy",
    },
    alert: {
      icon: AlertTriangle,
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
      label: "Alert",
    },
    fault: {
      icon: XCircle,
      color: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      label: "Fault",
    },
  };

  const config = statusConfig[currentStatus];
  const StatusIcon = config.icon;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-lg">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">AI Health Prediction & Diagnosis</h3>
          <p className="text-sm text-gray-600">Machine learning powered analysis</p>
        </div>
      </div>

      {/* Current Status Section */}
      <div className={`${config.bgColor} border-2 ${config.borderColor} rounded-lg p-6 mb-6`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <StatusIcon className={`w-12 h-12 ${config.textColor}`} />
            </motion.div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Current Classification</div>
              <div className={`text-3xl font-bold ${config.textColor}`}>{config.label}</div>
            </div>
          </div>
          <Badge className={`${config.color} text-white text-lg px-4 py-2`}>{config.label.toUpperCase()}</Badge>
        </div>

        {/* Confidence Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">AI Confidence Score</span>
            <span className="text-lg font-bold text-gray-900">{confidence}%</span>
          </div>
          <Progress value={confidence} className="h-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Root Cause Analysis */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h4 className="font-bold text-orange-900">Root Cause Hints</h4>
          </div>
          {rootCause.length > 0 ? (
            <ul className="space-y-2">
              {rootCause.map((cause, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-2 text-sm text-orange-800"
                >
                  <span className="text-orange-600 mt-0.5">•</span>
                  <span>{cause}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-orange-700">No issues detected</p>
          )}
        </div>

        {/* Maintenance Actions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-blue-900">Suggested Maintenance</h4>
          </div>
          {maintenanceActions.length > 0 ? (
            <ul className="space-y-2">
              {maintenanceActions.map((action, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-2 text-sm text-blue-800"
                >
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>{action}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-blue-700">No maintenance required</p>
          )}
        </div>
      </div>

      {/* Prediction History Timeline */}
      <div>
        <h4 className="font-bold text-gray-900 mb-4">Prediction History (Last 10)</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {predictionHistory.map((prediction, idx) => {
            const historyConfig = statusConfig[prediction.status];
            const HistoryIcon = historyConfig.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center justify-between p-3 ${historyConfig.bgColor} border ${historyConfig.borderColor} rounded-lg`}
              >
                <div className="flex items-center gap-3">
                  <HistoryIcon className={`w-5 h-5 ${historyConfig.textColor}`} />
                  <div>
                    <div className={`font-medium ${historyConfig.textColor}`}>{historyConfig.label}</div>
                    <div className="text-xs text-gray-600">{prediction.timestamp}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">{prediction.confidence}%</div>
                  <div className="text-xs text-gray-500">confidence</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
