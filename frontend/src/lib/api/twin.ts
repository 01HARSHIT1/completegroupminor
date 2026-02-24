import { getBabylonBase } from "./config";
import type { TwinState } from "./types";

const base = getBabylonBase();

export async function getTwinState(): Promise<TwinState | null> {
  try {
    const res = await fetch(`${base}/api/twin/state`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
