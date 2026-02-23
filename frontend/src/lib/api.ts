/**
 * API client for Smart Irrigation Digital Twin
 * Connects to Backend (central API) and Babylon (digital twin) services.
 */

import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BABYLON_URL = import.meta.env.VITE_BABYLON_API_URL || "http://localhost:5004";

export interface SensorDataBackend {
  vibration_rms?: number;
  temperature_C?: number;
  current_A?: number;
  flow_rate_Lmin?: number;
  tank_level_cm?: number;
  ph_value?: number;
  turbidity_NTU?: number;
  pump_status?: string;
  pump_runtime_min?: number;
  voltage_V?: number;
  timestamp?: number;
  [key: string]: unknown;
}

export interface PredictionBackend {
  health_score?: number;
  condition?: string;
  condition_code?: number;
  confidence?: number;
  failure_probability?: number;
  performance_efficiency?: number;
  leakage_detected?: boolean;
  blockage_detected?: boolean;
  alerts?: string[];
  recommendations?: string[];
  timestamp?: number;
  [key: string]: unknown;
}

export interface PumpStatus {
  pump_status: string;
  runtime_min?: number;
}

export interface TwinState {
  pumpOn?: boolean;
  sensors?: Record<string, number>;
  health?: { condition?: string; health_score?: number; confidence?: number };
  lastSync?: string | null;
  timestamp?: number | null;
}

function getBase(): string {
  return API_URL.replace(/\/$/, "");
}

export async function getSensorData(): Promise<SensorDataBackend> {
  const res = await fetch(`${getBase()}/api/sensors`);
  if (!res.ok) throw new Error(`Sensors API error: ${res.status}`);
  return res.json();
}

export async function getPredictions(): Promise<PredictionBackend> {
  const res = await fetch(`${getBase()}/api/predictions`);
  if (!res.ok) throw new Error(`Predictions API error: ${res.status}`);
  return res.json();
}

export async function getPumpStatus(): Promise<PumpStatus> {
  const res = await fetch(`${getBase()}/api/pump/status`);
  if (!res.ok) throw new Error(`Pump status API error: ${res.status}`);
  const data = await res.json();
  return {
    pump_status: data.pump_status ?? "OFF",
    runtime_min: data.runtime_min ?? 0,
  };
}

export async function turnPumpOn(): Promise<{ pump_status: string }> {
  const res = await fetch(`${getBase()}/api/pump/on`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Pump ON failed: ${res.status}`);
  }
  const data = await res.json();
  return { pump_status: data.pump_status ?? "ON" };
}

export async function turnPumpOff(): Promise<{ pump_status: string }> {
  const res = await fetch(`${getBase()}/api/pump/off`, { method: "POST" });
  if (!res.ok) throw new Error(`Pump OFF failed: ${res.status}`);
  const data = await res.json();
  return { pump_status: data.pump_status ?? "OFF" };
}

export function createRealtimeConnection(
  onSensor: (data: SensorDataBackend) => void,
  onPrediction: (data: PredictionBackend) => void,
  onPumpStatus: (data: { status: string }) => void
): Promise<{ close: () => void }> {
  return new Promise((resolve) => {
    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 5000,
    });

    socket.on("connect", () => {
      resolve({
        close: () => {
          socket.disconnect();
          socket.removeAllListeners();
        },
      });
    });

    socket.on("sensor-update", onSensor);
    socket.on("prediction-update", onPrediction);
    socket.on("pump-status", onPumpStatus);

    socket.on("connect_error", () => {
      resolve({
        close: () => {
          socket.disconnect();
          socket.removeAllListeners();
        },
      });
    });
  });
}

export async function getTwinState(): Promise<TwinState | null> {
  const base = BABYLON_URL.replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/api/twin/state`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
