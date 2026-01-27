/**
 * API Client for Smart Irrigation Dashboard
 * Handles all API calls to backend server
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';

export interface SensorData {
  vibration_rms: number;
  temperature_C: number;
  current_A: number;
  flow_rate_Lmin: number;
  tank_level_cm: number;
  ph_value: number;
  turbidity_NTU: number;
  pump_status: 'ON' | 'OFF';
  pump_runtime_min: number;
  timestamp: number;
}

export interface Prediction {
  health_score: number;
  condition: string;
  condition_code: number;
  confidence: number;
  failure_probability: number;
  performance_efficiency: number;
  leakage_detected: boolean;
  blockage_detected: boolean;
  alerts: string[];
  recommendations: string[];
  timestamp?: number;
}

// Fetch latest sensor data
export async function getSensorData(): Promise<SensorData> {
  const response = await fetch(`${API_URL}/api/sensors`);
  if (!response.ok) {
    throw new Error('Failed to fetch sensor data');
  }
  return response.json();
}

// Fetch historical sensor data
export async function getHistoricalData(limit: number = 50): Promise<SensorData[]> {
  const response = await fetch(`${API_URL}/api/sensors/history?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch historical data');
  }
  return response.json();
}

// Fetch ML predictions
export async function getPredictions(): Promise<Prediction> {
  const response = await fetch(`${API_URL}/api/predictions`);
  if (!response.ok) {
    throw new Error('Failed to fetch predictions');
  }
  return response.json();
}

// Turn pump ON
export async function turnPumpOn(): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_URL}/api/pump/on`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to turn pump ON');
  }
  return response.json();
}

// Turn pump OFF
export async function turnPumpOff(): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_URL}/api/pump/off`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to turn pump OFF');
  }
  return response.json();
}

// Get pump status
export async function getPumpStatus(): Promise<{ pump_status: string; runtime_min: number }> {
  const response = await fetch(`${API_URL}/api/pump/status`);
  if (!response.ok) {
    throw new Error('Failed to fetch pump status');
  }
  return response.json();
}

// WebSocket connection for real-time updates
export function createWebSocketConnection(
  onSensorUpdate: (data: SensorData) => void,
  onPredictionUpdate: (data: Prediction) => void,
  onPumpStatus: (status: { status: string }) => void
): WebSocket {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('WebSocket connected');
    // Request initial data
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'request-data' }));
    }
  };

  ws.onmessage = (event) => {
    try {
      // Handle both string and object messages
      let data;
      if (typeof event.data === 'string') {
        data = JSON.parse(event.data);
      } else {
        data = event.data;
      }
      
      // Check if it's a sensor update (has sensor fields)
      if (data.vibration_rms !== undefined || data.temperature_C !== undefined) {
        onSensorUpdate(data as SensorData);
      }
      // Check if it's a prediction update (has prediction fields)
      else if (data.health_score !== undefined || data.condition !== undefined) {
        onPredictionUpdate(data as Prediction);
      }
      // Check if it's a pump status update
      else if (data.status || data.pump_status) {
        onPumpStatus({ status: data.status || data.pump_status });
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    // Attempt to reconnect after 3 seconds
    setTimeout(() => {
      createWebSocketConnection(onSensorUpdate, onPredictionUpdate, onPumpStatus);
    }, 3000);
  };

  return ws;
}
