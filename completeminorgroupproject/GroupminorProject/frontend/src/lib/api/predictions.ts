import { getApiBase } from "./config";
import type { PredictionBackend } from "./types";

const base = getApiBase();

export async function getPredictions(): Promise<PredictionBackend> {
  const res = await fetch(`${base}/api/predictions`);
  if (!res.ok) throw new Error(`Predictions API error: ${res.status}`);
  return res.json();
}
