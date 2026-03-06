import { io } from "socket.io-client";
import { getApiBase } from "./config";
import type { SensorDataBackend, PredictionBackend } from "./types";

const API_URL = getApiBase();

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
