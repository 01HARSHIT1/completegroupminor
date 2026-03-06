const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BABYLON_URL = import.meta.env.VITE_BABYLON_API_URL || "http://localhost:5004";

export function getApiBase() {
  return API_URL.replace(/\/$/, "");
}

export function getBabylonBase() {
  return BABYLON_URL.replace(/\/$/, "");
}
