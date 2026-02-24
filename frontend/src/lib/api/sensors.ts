import { getApiBase } from "./config";
import type { SensorDataBackend } from "./types";

const base = getApiBase();

export async function getSensorData(): Promise<SensorDataBackend> {
  const res = await fetch(`${base}/api/sensors`);
  if (!res.ok) throw new Error(`Sensors API error: ${res.status}`);
  return res.json();
}
