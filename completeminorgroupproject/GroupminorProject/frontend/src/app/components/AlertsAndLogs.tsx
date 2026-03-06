import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Bell, AlertTriangle, XCircle, CheckCircle, Download, Filter } from "lucide-react";
import { motion } from "motion/react";
import { ScrollArea } from "./ui/scroll-area";

interface Alert {
  id: string;
  timestamp: string;
  sensor: string;
  severity: "info" | "warning" | "critical";
  message: string;
  isResolved: boolean;
}

interface AlertsAndLogsProps {
  alerts: Alert[];
  onMarkResolved: (id: string) => void;
}

export function AlertsAndLogs({ alerts, onMarkResolved }: AlertsAndLogsProps) {
  const [filter, setFilter] = useState<"all" | "warning" | "critical">("all");

  const severityConfig = {
    info: {
      icon: Bell,
      color: "bg-blue-500",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      label: "Info",
    },
    warning: {
      icon: AlertTriangle,
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
      label: "Alert",
    },
    critical: {
      icon: XCircle,
      color: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      label: "Fault",
    },
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "all") return true;
    if (filter === "warning") return alert.severity === "warning";
    if (filter === "critical") return alert.severity === "critical";
    return true;
  });

  const unresolvedCount = alerts.filter((a) => !a.isResolved).length;

  const handleDownloadLogs = () => {
    // Mock download functionality
    const logData = alerts
      .map((a) => `${a.timestamp} | ${a.severity.toUpperCase()} | ${a.sensor} | ${a.message}`)
      .join("\n");
    const blob = new Blob([logData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `irrigation-system-logs-${new Date().toISOString()}.txt`;
    a.click();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-500 p-3 rounded-lg relative">
            <Bell className="w-6 h-6 text-white" />
            {unresolvedCount > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                {unresolvedCount}
              </motion.div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold">Alerts, Faults & Logs</h3>
            <p className="text-sm text-gray-600">{unresolvedCount} unresolved alerts</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownloadLogs}>
          <Download className="w-4 h-4 mr-2" />
          Download Logs
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            All Logs ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="warning" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alerts ({alerts.filter((a) => a.severity === "warning").length})
          </TabsTrigger>
          <TabsTrigger value="critical" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Faults ({alerts.filter((a) => a.severity === "critical").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Alerts List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert, idx) => {
              const config = severityConfig[alert.severity];
              const SeverityIcon = config.icon;

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`${config.bgColor} border-2 ${config.borderColor} rounded-lg p-4 ${
                    alert.isResolved ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`${config.color} p-2 rounded`}>
                        <SeverityIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${config.color} text-white`}>{config.label}</Badge>
                          <span className="text-xs text-gray-600">{alert.timestamp}</span>
                          {alert.isResolved && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-1">{alert.message}</div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Sensor:</span> {alert.sensor}
                        </div>
                      </div>
                    </div>
                    {!alert.isResolved && (
                      <Button variant="outline" size="sm" onClick={() => onMarkResolved(alert.id)}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No alerts to display</p>
              <p className="text-sm">Your system is running smoothly</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
