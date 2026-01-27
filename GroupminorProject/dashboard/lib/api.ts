/**
 * API Client for Smart Irrigation Dashboard
 * Handles all API calls to backend server with error handling and fallback
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';

// Check if we're in browser and backend is available
const isBackendAvailable = typeof window !== 'undefined' && API_URL !== 'http://localhost:5000';

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

// Mock data for when backend is unavailable
const getMockSensorData = (): SensorData => ({
  vibration_rms: 0.5 + Math.random() * 0.5,
  temperature_C: 35 + Math.random() * 5,
  current_A: 2 + Math.random() * 1,
  flow_rate_Lmin: 8 + Math.random() * 2,
  tank_level_cm: 25 + Math.random() * 5,
  ph_value: 7 + (Math.random() - 0.5) * 0.5,
  turbidity_NTU: 45 + Math.random() * 10,
  pump_status: 'OFF',
  pump_runtime_min: 0,
  timestamp: Date.now(),
});

const getMockPrediction = (): Prediction => ({
  health_score: 85 + Math.random() * 10,
  condition: 'Normal',
  condition_code: 0,
  confidence: 0.9,
  failure_probability: 0.05,
  performance_efficiency: 80 + Math.random() * 15,
  leakage_detected: false,
  blockage_detected: false,
  alerts: [],
  recommendations: ['System operating normally'],
  timestamp: Date.now(),
});

// Helper function to handle API calls with fallback
async function fetchWithFallback<T>(
  url: string,
  mockData: () => T,
  errorMessage: string
): Promise<T> {
  try {
    // Only try to fetch if we have a valid API URL (not localhost in production)
    if (typeof window !== 'undefined' && (API_URL.includes('localhost') || API_URL.includes('127.0.0.1'))) {
      // In browser with localhost - check if backend is actually running
      const response = await fetch(url, { 
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } else if (API_URL && !API_URL.includes('localhost')) {
      // Production URL - try to fetch
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } else {
      // No API URL configured - use mock data
      console.warn('Backend not configured. Using mock data.');
      return mockData();
    }
  } catch (error) {
    // Connection refused, timeout, or other network errors
    console.warn(`${errorMessage}. Using mock data.`, error);
    return mockData();
  }
}

// Fetch latest sensor data
export async function getSensorData(): Promise<SensorData> {
  return fetchWithFallback(
    `${API_URL}/api/sensors`,
    getMockSensorData,
    'Backend server not available'
  );
}

// Fetch historical sensor data
export async function getHistoricalData(limit: number = 50): Promise<SensorData[]> {
  try {
    const response = await fetch(`${API_URL}/api/sensors/history?limit=${limit}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) {
      throw new Error('Failed to fetch historical data');
    }
    return response.json();
  } catch (error) {
    console.warn('Historical data not available. Generating mock data.');
    // Generate mock historical data
    return Array.from({ length: limit }, (_, i) => ({
      ...getMockSensorData(),
      timestamp: Date.now() - (limit - i) * 60000, // 1 minute intervals
    }));
  }
}

// Fetch ML predictions
export async function getPredictions(): Promise<Prediction> {
  return fetchWithFallback(
    `${API_URL}/api/predictions`,
    getMockPrediction,
    'ML prediction API not available'
  );
}

// Turn pump ON
export async function turnPumpOn(): Promise<{ status: string; message: string }> {
  try {
    const response = await fetch(`${API_URL}/api/pump/on`, {
      method: 'POST',
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to turn pump ON');
    }
    return response.json();
  } catch (error) {
    console.warn('Pump control not available:', error);
    return { status: 'error', message: 'Backend server not available' };
  }
}

// Turn pump OFF
export async function turnPumpOff(): Promise<{ status: string; message: string }> {
  try {
    const response = await fetch(`${API_URL}/api/pump/off`, {
      method: 'POST',
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) {
      throw new Error('Failed to turn pump OFF');
    }
    return response.json();
  } catch (error) {
    console.warn('Pump control not available:', error);
    return { status: 'error', message: 'Backend server not available' };
  }
}

// Get pump status
export async function getPumpStatus(): Promise<{ pump_status: string; runtime_min: number }> {
  try {
    const response = await fetch(`${API_URL}/api/pump/status`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) {
      throw new Error('Failed to fetch pump status');
    }
    return response.json();
  } catch (error) {
    console.warn('Pump status not available. Using default.');
    return { pump_status: 'OFF', runtime_min: 0 };
  }
}

// WebSocket connection for real-time updates
export function createWebSocketConnection(
  onSensorUpdate: (data: SensorData) => void,
  onPredictionUpdate: (data: Prediction) => void,
  onPumpStatus: (status: { status: string }) => void
): WebSocket | null {
  // Don't try WebSocket if using localhost in production
  if (typeof window !== 'undefined' && WS_URL.includes('localhost') && window.location.hostname !== 'localhost') {
    console.warn('WebSocket disabled: localhost not available in production');
    // Fallback: Use polling instead
    const interval = setInterval(async () => {
      try {
        const [sensorData, prediction] = await Promise.all([
          getSensorData(),
          getPredictions()
        ]);
        onSensorUpdate(sensorData);
        onPredictionUpdate(prediction);
      } catch (error) {
        // Already handled by getSensorData/getPredictions
      }
    }, 5000); // Poll every 5 seconds
    
    // Return a mock WebSocket-like object
    return {
      close: () => clearInterval(interval),
      readyState: WebSocket.CONNECTING,
    } as any;
  }

  try {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WebSocket connected');
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'request-data' }));
      }
    };

    ws.onmessage = (event) => {
      try {
        let data;
        if (typeof event.data === 'string') {
          data = JSON.parse(event.data);
        } else {
          data = event.data;
        }
        
        if (data.vibration_rms !== undefined || data.temperature_C !== undefined) {
          onSensorUpdate(data as SensorData);
        } else if (data.health_score !== undefined || data.condition !== undefined) {
          onPredictionUpdate(data as Prediction);
        } else if (data.status || data.pump_status) {
          onPumpStatus({ status: data.status || data.pump_status });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onerror = (error) => {
      console.warn('WebSocket connection failed. Using polling fallback.');
      // Don't log as error - it's expected if backend isn't running
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Only reconnect if we have a valid WS URL
      if (WS_URL && !WS_URL.includes('localhost')) {
        setTimeout(() => {
          createWebSocketConnection(onSensorUpdate, onPredictionUpdate, onPumpStatus);
        }, 3000);
      }
    };

    return ws;
  } catch (error) {
    console.warn('WebSocket not available. Using polling fallback.');
    // Fallback to polling
    const interval = setInterval(async () => {
      try {
        const [sensorData, prediction] = await Promise.all([
          getSensorData(),
          getPredictions()
        ]);
        onSensorUpdate(sensorData);
        onPredictionUpdate(prediction);
      } catch (error) {
        // Already handled
      }
    }, 5000);
    
    return {
      close: () => clearInterval(interval),
      readyState: WebSocket.CLOSED,
    } as any;
  }
}
