import { useState, useEffect, useCallback } from "react";
import { SystemHealthOverview } from "./components/SystemHealthOverview";
import { SensorGrid } from "./components/SensorGrid";
import { ElectricityPanel } from "./components/ElectricityPanel";
import { CameraFeed } from "./components/CameraFeed";
import { MotorControl } from "./components/MotorControl";
import { AIHealthPrediction } from "./components/AIHealthPrediction";
import { AlertsAndLogs } from "./components/AlertsAndLogs";
import { HistoricalAnalytics } from "./components/HistoricalAnalytics";
import { DigitalTwinVisualization } from "./components/DigitalTwinVisualization";
import { SystemStatus } from "./components/SystemStatus";
import { Zap, Thermometer, Activity, Droplet, Gauge } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import {
  getSensorData,
  getPredictions,
  getPumpStatus,
  turnPumpOn,
  turnPumpOff,
  createRealtimeConnection,
  getTwinState,
  type SensorDataBackend,
  type PredictionBackend,
} from "../lib/api";

function conditionToHealth(condition: string): "healthy" | "alert" | "fault" {
  const c = (condition || "").toLowerCase();
  if (c.includes("fault") || c.includes("failure") || c.includes("risk high")) return "fault";
  if (c.includes("warning") || c.includes("leakage") || c.includes("blockage") || c.includes("elevated")) return "alert";
  return "healthy";
}

function mapBackendToSensor(s: SensorDataBackend) {
  return {
    current: s.current_A ?? 4.2,
    temperature: s.temperature_C ?? 42,
    vibration: s.vibration_rms ?? 3,
    flow: s.flow_rate_Lmin ?? 85,
    voltage: 230,
  };
}

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [motorRunning, setMotorRunning] = useState(false);
  const [runningDuration, setRunningDuration] = useState(0);
  const [healthStatus, setHealthStatus] = useState<"healthy" | "alert" | "fault">("healthy");
  const [backendConnected, setBackendConnected] = useState(false);
  const [twinLastSync, setTwinLastSync] = useState<string | null>(null);

  const [sensorData, setSensorData] = useState({
    current: 4.2,
    temperature: 42.5,
    vibration: 3.2,
    flow: 85.0,
    voltage: 230.0,
  });

  const [prediction, setPrediction] = useState<PredictionBackend | null>(null);
  const [resolvedAlertIds, setResolvedAlertIds] = useState<Set<string>>(new Set(["2", "4"]));
  const [alerts, setAlerts] = useState<
    { id: string; timestamp: string; sensor: string; severity: "info" | "warning" | "critical"; message: string; isResolved: boolean }[]
  >([
    { id: "1", timestamp: "2026-02-22 14:30:15", sensor: "Temperature Sensor", severity: "warning", message: "Temperature slightly elevated - Monitor closely", isResolved: false },
    { id: "2", timestamp: "2026-02-22 13:15:42", sensor: "Current Sensor", severity: "critical", message: "Overcurrent detected - Immediate attention required", isResolved: true },
    { id: "3", timestamp: "2026-02-22 12:45:22", sensor: "Vibration Sensor", severity: "warning", message: "Vibration levels above normal threshold", isResolved: false },
    { id: "4", timestamp: "2026-02-22 11:20:10", sensor: "Flow Sensor", severity: "info", message: "Flow rate optimal - System performing well", isResolved: true },
  ]);

  // Generate historical data
  const generateHistoricalData = (points: number, interval: string) => {
    return Array.from({ length: points }, (_, i) => {
      const baseTime = new Date();
      let timeLabel = "";

      if (interval === "1h") {
        baseTime.setMinutes(baseTime.getMinutes() - (points - i) * 5);
        timeLabel = baseTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else if (interval === "24h") {
        baseTime.setHours(baseTime.getHours() - (points - i));
        timeLabel = baseTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else if (interval === "7d") {
        baseTime.setDate(baseTime.getDate() - (points - i));
        timeLabel = baseTime.toLocaleDateString([], { month: "short", day: "numeric" });
      } else {
        baseTime.setDate(baseTime.getDate() - (points - i));
        timeLabel = baseTime.toLocaleDateString([], { month: "short", day: "numeric" });
      }

      return {
        timestamp: timeLabel,
        current: 4.0 + Math.random() * 0.8,
        temperature: 40 + Math.random() * 5,
        vibration: 2.8 + Math.random() * 0.8,
        flow: 80 + Math.random() * 10,
        health: 85 + Math.random() * 10,
      };
    });
  };

  // Generate electricity data
  const generateElectricityData = (points: number, interval: string) => {
    return Array.from({ length: points }, (_, i) => {
      const baseTime = new Date();
      let timeLabel = "";

      if (interval === "today") {
        baseTime.setHours(baseTime.getHours() - (points - i));
        timeLabel = baseTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else if (interval === "week") {
        baseTime.setDate(baseTime.getDate() - (points - i));
        timeLabel = baseTime.toLocaleDateString([], { weekday: "short" });
      } else {
        baseTime.setDate(baseTime.getDate() - (points - i));
        timeLabel = baseTime.toLocaleDateString([], { month: "short", day: "numeric" });
      }

      const power = 800 + Math.random() * 400;
      const energy = (i + 1) * 0.8 + Math.random() * 0.2;

      return {
        timestamp: timeLabel,
        power,
        energy,
      };
    });
  };

  // Fetch initial data and subscribe to Backend 2 (central API) real-time updates
  useEffect(() => {
    let closed = false;
    const applySensor = (s: SensorDataBackend) => {
      if (closed) return;
      setSensorData(mapBackendToSensor(s));
      setBackendConnected(true);
    };
    const applyPrediction = (p: PredictionBackend) => {
      if (closed) return;
      setPrediction(p);
      setHealthStatus(conditionToHealth(p.condition));
      setBackendConnected(true);
    };
    const applyPumpStatus = (status: { status: string }) => {
      if (closed) return;
      setMotorRunning(status.status === "ON");
    };

    (async () => {
      try {
        const [sensors, pred, pump] = await Promise.all([getSensorData(), getPredictions(), getPumpStatus()]);
        if (closed) return;
        applySensor(sensors);
        applyPrediction(pred);
        applyPumpStatus({ status: pump.pump_status });
        setRunningDuration((pump.runtime_min || 0) * 60);
      } catch {
        if (!closed) setBackendConnected(false);
      }
    })();

    const connRef = { current: { close: () => {} } as { close: () => void } };
    createRealtimeConnection(applySensor, applyPrediction, applyPumpStatus).then((c) => {
      connRef.current = c;
      if (closed) c.close();
    });
    return () => {
      closed = true;
      connRef.current.close();
    };
  }, []);

  // Sync alerts from backend prediction when available
  useEffect(() => {
    if (!prediction?.alerts?.length) return;
    setAlerts((prev) => {
      const existing = prev.filter((a) => !a.id.startsWith("backend-"));
      const backendAlerts = prediction.alerts!.map((msg, i) => ({
        id: `backend-${i}`,
        timestamp: new Date().toLocaleString("sv-SE").replace("T", " ").slice(0, 19),
        sensor: "System",
        severity: "warning" as const,
        message: msg,
        isResolved: resolvedAlertIds.has(`backend-${i}`),
      }));
      return [...existing, ...backendAlerts];
    });
  }, [prediction?.alerts?.join("|") ?? ""]);

  // Optional: Twin state from Backend 4 (Babylon) every 5s
  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      getTwinState()
        .then((twin) => {
          if (!cancelled && twin?.lastSync) setTwinLastSync(twin.lastSync);
        })
        .catch(() => {});
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update motor running duration
  useEffect(() => {
    if (motorRunning) {
      const interval = setInterval(() => {
        setRunningDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [motorRunning]);

  // Generate sensor trend data
  const generateTrendData = (baseValue: number, variance: number) => {
    return Array.from({ length: 20 }, () => baseValue + (Math.random() - 0.5) * variance);
  };

  const sensors = [
    {
      iconName: "zap",
      icon: Zap,
      name: "Current",
      value: sensorData.current,
      unit: "A",
      safeRange: [3.5, 5.0] as [number, number],
      trendData: generateTrendData(sensorData.current, 0.5),
      status: (sensorData.current >= 3.5 && sensorData.current <= 5.0 ? "normal" : "critical") as "normal" | "warning" | "critical",
    },
    {
      iconName: "thermometer",
      icon: Thermometer,
      name: "Temperature",
      value: sensorData.temperature,
      unit: "°C",
      safeRange: [35, 45] as [number, number],
      trendData: generateTrendData(sensorData.temperature, 2),
      status: (sensorData.temperature > 48 ? "critical" : sensorData.temperature > 45 ? "warning" : "normal") as "normal" | "warning" | "critical",
    },
    {
      iconName: "activity",
      icon: Activity,
      name: "Vibration",
      value: sensorData.vibration,
      unit: "mm/s",
      safeRange: [0, 3.5] as [number, number],
      trendData: generateTrendData(sensorData.vibration, 0.3),
      status: (sensorData.vibration > 4.0 ? "critical" : sensorData.vibration > 3.5 ? "warning" : "normal") as "normal" | "warning" | "critical",
    },
    {
      iconName: "droplet",
      icon: Droplet,
      name: "Water Flow",
      value: sensorData.flow,
      unit: "L/min",
      safeRange: [80, 100] as [number, number],
      trendData: generateTrendData(sensorData.flow, 5),
      status: (sensorData.flow >= 80 && sensorData.flow <= 100 ? "normal" : "warning") as "normal" | "warning" | "critical",
    },
    {
      iconName: "gauge",
      icon: Gauge,
      name: "Voltage",
      value: sensorData.voltage,
      unit: "V",
      safeRange: [220, 240] as [number, number],
      trendData: generateTrendData(sensorData.voltage, 3),
      status: (sensorData.voltage >= 220 && sensorData.voltage <= 240 ? "normal" : "critical") as "normal" | "warning" | "critical",
    },
  ];

  const handleMotorToggle = async (state: boolean) => {
    try {
      if (state) {
        await turnPumpOn();
        setMotorRunning(true);
        toast.success("Motor Started", { description: "Irrigation system is now active" });
      } else {
        await turnPumpOff();
        setMotorRunning(false);
        toast.info("Motor Stopped", {
          description: `Total runtime: ${Math.floor(runningDuration / 3600)}h ${Math.floor((runningDuration % 3600) / 60)}m`,
        });
        setRunningDuration(0);
      }
    } catch {
      toast.error("Backend unavailable", { description: "Could not change pump state. Is the central API running on port 5000?" });
    }
  };

  const handleMarkResolved = useCallback((id: string) => {
    setResolvedAlertIds((prev) => new Set(prev).add(id));
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, isResolved: true } : alert))
    );
    toast.success("Alert Resolved", { description: "Alert has been marked as resolved" });
  }, []);

  const getHealthReason = () => {
    if (healthStatus === "fault") {
      if (sensorData.temperature > 48) return "Temperature critically high";
      if (sensorData.vibration > 4.0) return "Excessive vibration detected";
      return "Multiple parameters out of range";
    } else if (healthStatus === "alert") {
      if (sensorData.temperature > 45) return "Temperature elevated - monitor closely";
      if (sensorData.vibration > 3.5) return "Vibration slightly high";
      return "Minor anomaly detected";
    }
    return "All parameters within normal range";
  };

  const getRootCauses = () => {
    const causes: string[] = [];
    if (sensorData.temperature > 45) causes.push("High temperature detected");
    if (sensorData.vibration > 3.5) causes.push("Vibration levels above threshold");
    if (sensorData.current > 4.8) causes.push("Current draw higher than expected");
    return causes;
  };

  const getMaintenanceActions = () => {
    const actions: string[] = [];
    if (sensorData.temperature > 45) actions.push("Check cooling system and ventilation");
    if (sensorData.vibration > 3.5) actions.push("Inspect bearings and mounting");
    if (sensorData.flow < 85) actions.push("Check for blockages in water lines");
    if (actions.length === 0) actions.push("Continue regular monitoring");
    return actions;
  };

  const predictionHistory = Array.from({ length: 10 }, (_, i) => {
    const time = new Date();
    time.setMinutes(time.getMinutes() - (10 - i) * 5);
    if (i === 0 && prediction) {
      return {
        timestamp: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: conditionToHealth(prediction.condition),
        confidence: Math.round((prediction.confidence ?? 0.85) * 100),
      };
    }
    const randomStatus = Math.random();
    return {
      timestamp: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: (randomStatus > 0.8 ? "alert" : randomStatus > 0.95 ? "fault" : "healthy") as "healthy" | "alert" | "fault",
      confidence: 85 + Math.floor(Math.random() * 12),
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-500 to-blue-600 p-3 rounded-lg">
                <Droplet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Smart Irrigation Dashboard</h1>
                <p className="text-sm text-gray-600">Digital Twin Control Center</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Current Time</div>
              <div className="text-xl font-bold text-gray-900">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* System Health Overview */}
        <SystemHealthOverview
          healthStatus={healthStatus}
          aiPrediction={backendConnected ? "AI Model v2.3 (Live)" : "AI Model v2.3 (Demo)"}
          reason={getHealthReason()}
          lastUpdated={currentTime}
          isOnline={backendConnected}
        />

        {/* Live Sensor Readings */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Live Sensor Readings</h2>
          <SensorGrid sensors={sensors} />
        </section>

        {/* Motor Control and Camera Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MotorControl
            isRunning={motorRunning}
            onToggle={handleMotorToggle}
            runningDuration={runningDuration}
          />
          <CameraFeed isOnline={true} />
        </div>

        {/* Electricity Consumption */}
        <ElectricityPanel
          currentPower={motorRunning ? 1000 + Math.random() * 200 : 50}
          todayData={generateElectricityData(24, "today")}
          weekData={generateElectricityData(7, "week")}
          monthData={generateElectricityData(30, "month")}
          totalEnergyToday={12.5}
          totalEnergyWeek={87.3}
          totalEnergyMonth={365.8}
          motorOnTimeToday="6.5h"
          motorOnTimeWeek="45.2h"
          motorOnTimeMonth="189.5h"
          estimatedCostMonth={2194}
        />

        {/* AI Health Prediction */}
        <AIHealthPrediction
          currentStatus={healthStatus}
          confidence={prediction ? Math.round((prediction.confidence ?? 0.87) * 100) : 87}
          rootCause={getRootCauses()}
          maintenanceActions={getMaintenanceActions()}
          predictionHistory={predictionHistory}
        />

        {/* Alerts and Logs */}
        <AlertsAndLogs alerts={alerts} onMarkResolved={handleMarkResolved} />

        {/* Historical Analytics */}
        <HistoricalAnalytics
          hourData={generateHistoricalData(12, "1h")}
          dayData={generateHistoricalData(24, "24h")}
          weekData={generateHistoricalData(7, "7d")}
          monthData={generateHistoricalData(30, "30d")}
        />

        {/* Digital Twin Visualization (Backend 4 - Babylon) */}
        <DigitalTwinVisualization lastSync={twinLastSync} />

        {/* System Status */}
        <SystemStatus
          esp32Connected={backendConnected}
          wifiSignalStrength={78}
          lastDataReceived={currentTime}
          cameraOnline={true}
          sensorHealth={{
            current: true,
            temperature: sensorData.temperature < 48,
            vibration: sensorData.vibration < 4.0,
            flow: true,
            voltage: true,
          }}
          firmwareVersion="2.3.1"
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>Digital Twin Smart Irrigation System © 2026 | Real-time monitoring and control</p>
          <p className="mt-1">Powered by IoT, AI & Cloud Technology</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
