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
