import { getApiBase } from "./config";
import type { PumpStatus } from "./types";

const base = getApiBase();

export async function getPumpStatus(): Promise<PumpStatus> {
  const res = await fetch(`${base}/api/pump/status`);
  if (!res.ok) throw new Error(`Pump status API error: ${res.status}`);
  const data = await res.json();
  return {
    pump_status: data.pump_status ?? "OFF",
    runtime_min: data.runtime_min ?? 0,
  };
}

export async function turnPumpOn(): Promise<{ pump_status: string }> {
  const res = await fetch(`${base}/api/pump/on`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Pump ON failed: ${res.status}`);
  }
  const data = await res.json();
  return { pump_status: data.pump_status ?? "ON" };
}

export async function turnPumpOff(): Promise<{ pump_status: string }> {
  const res = await fetch(`${base}/api/pump/off`, { method: "POST" });
  if (!res.ok) throw new Error(`Pump OFF failed: ${res.status}`);
  const data = await res.json();
  return { pump_status: data.pump_status ?? "OFF" };
}
