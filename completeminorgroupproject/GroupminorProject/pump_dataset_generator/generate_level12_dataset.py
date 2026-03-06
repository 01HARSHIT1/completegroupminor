"""
Level-1 + Level-2 pump dataset generator with REAL-WORLD REALISM.
Output: time, current, temperature, vibration, flow, health, rul, label (50k rows).
"""
import numpy as np
import pandas as pd
from scipy.integrate import solve_ivp

# ==========================
# GLOBAL SETTINGS
# ==========================

DT = 0.05
SIM_TIME = 6
TARGET_ROWS = 50_000
CYCLES = 470

VOLTAGE_LEVELS = [0.9, 1.0, 1.1]
LOAD_LEVELS = [0.4, 0.7, 1.0]

BASE_TEMP_NOMINAL = 28
MAX_RUL = 500

# ==========================
# 1) SENSOR OFFSET & SCALING ERROR (real sensors never exact)
# ==========================
CURRENT_OFFSET_A = 0.12      # ACS712 typical offset
TEMP_BIAS_C = 2.0            # NTC / thermistor bias
VIBRATION_GAIN_ERROR = 1.3   # MPU6050 amplitude scaling

# ==========================
# 2) ELECTRICAL SUPPLY FLUCTUATION (farm power drift 11.2V -> 12.8V)
# ==========================
VOLTAGE_MIN = 11.2
VOLTAGE_MAX = 12.8
VOLTAGE_DRIFT_PERIOD = 2500.0  # seconds over which drift happens

def voltage_with_drift(global_time):
    """Slow voltage drift: 11.2V -> 12.8V over time."""
    t = global_time % (2 * VOLTAGE_DRIFT_PERIOD)
    if t < VOLTAGE_DRIFT_PERIOD:
        return VOLTAGE_MIN + (VOLTAGE_MAX - VOLTAGE_MIN) * (t / VOLTAGE_DRIFT_PERIOD)
    else:
        return VOLTAGE_MAX - (VOLTAGE_MAX - VOLTAGE_MIN) * ((t - VOLTAGE_DRIFT_PERIOD) / VOLTAGE_DRIFT_PERIOD)

# ==========================
# 3) ENVIRONMENTAL TEMPERATURE CYCLES (25°C morning -> 40°C afternoon)
# ==========================
AMBIENT_MIN = 25.0
AMBIENT_MAX = 40.0
AMBIENT_CYCLE_PERIOD = 600.0  # seconds (e.g. morning-to-afternoon cycle)

def ambient_temperature(global_time):
    """Ambient cycles: 25°C morning, 40°C afternoon."""
    return AMBIENT_MIN + (AMBIENT_MAX - AMBIENT_MIN) * (0.5 + 0.5 * np.sin(2 * np.pi * global_time / AMBIENT_CYCLE_PERIOD))

# ==========================
# 4) MECHANICAL RANDOMNESS (per run: friction ±15%, efficiency ±10%, vib baseline ±20%)
# ==========================
def draw_run_randomness():
    """Real motors are not identical. Draw once per (Vscale, load) run."""
    friction_mult = 1.0 + 0.15 * (2 * np.random.rand() - 1)
    efficiency_mult = 1.0 + 0.10 * (2 * np.random.rand() - 1)
    vibration_baseline_mult = 1.0 + 0.20 * (2 * np.random.rand() - 1)
    return friction_mult, efficiency_mult, vibration_baseline_mult

# ==========================
# 5) SUDDEN DISTURBANCES (air bubbles, pipe shake, load jerk)
# ==========================
SPIKE_PROBABILITY = 0.002  # 0.2% per sample

def maybe_add_spike(current, vibration, flow):
    """Occasional spikes: air bubbles (flow), pipe shake (vib), load jerk (current)."""
    r = np.random.rand()
    if r < SPIKE_PROBABILITY / 3:
        current += np.random.uniform(0.3, 0.8) * np.random.choice([-1, 1])
    elif r < 2 * SPIKE_PROBABILITY / 3:
        vibration += np.random.uniform(0.2, 0.6)
    elif r < SPIKE_PROBABILITY:
        flow += np.random.uniform(-0.15, 0.15)
    return current, vibration, flow

# ==========================
# MOTOR PHYSICS (LEVEL 2)
# ==========================

R = 2.1
L = 0.45
Ke = 0.08
Kt = 0.08
J = 0.02
B = 0.002

def motor_dynamics(t, x, V, load, friction):
    i, w = x
    di = (V - R*i - Ke*w) / L
    dw = (Kt*i - (B*friction)*w - load) / J
    return [di, dw]

def simulate_cycle(V, load, friction):
    t_eval = np.arange(0, SIM_TIME, DT)
    sol = solve_ivp(motor_dynamics, [0, SIM_TIME], [0, 0],
                    t_eval=t_eval, args=(V, load, friction))
    return t_eval, sol.y[0], sol.y[1]

# ==========================
# AGING MODEL (LEVEL 1)
# ==========================

def update_health(health, current, temp):
    wear = 0.0009
    overload = 0.0015 * (current / 2.5) ** 2
    thermal = 0.001 * (temp / 80) ** 2
    health -= (wear + overload + thermal)
    return max(0, health)

def degradation_effects(health):
    wear = (100 - health) / 100
    friction = 1 + 2.2 * wear
    efficiency = 1 - 0.35 * wear
    vibration_gain = 1 + 3.5 * wear
    return friction, efficiency, vibration_gain

def label_state(health):
    if health > 70:
        return 0
    elif health > 35:
        return 1
    else:
        return 2

# ==========================
# SENSOR MODELS (with realism: noise only; offset/gain applied later)
# ==========================

def temperature_model(current, efficiency, ambient):
    temp = ambient + 1.7 * (current**2) / efficiency
    temp += np.random.normal(0, 0.4, len(current))
    return temp

def vibration_model(speed, gain, baseline_mult):
    vib = baseline_mult * gain * (0.3 + 0.002 * (speed**2))
    vib += 0.5 * np.sin(2 * np.pi * 120 * np.arange(len(speed)) * DT)
    vib += np.random.normal(0, 0.15, len(speed))
    return vib

def flow_model(speed, efficiency):
    flow = 0.07 * speed * efficiency
    flow += np.random.normal(0, 0.03, len(speed))
    return flow

# ==========================
# DATASET GENERATION
# ==========================

np.random.seed(42)
rows = []
health = 100
global_time = 0.0

for Vscale in VOLTAGE_LEVELS:
    for load in LOAD_LEVELS:
        # 4) Per-run mechanical randomness
        run_friction_mult, run_eff_mult, run_vib_baseline_mult = draw_run_randomness()

        for cycle in range(CYCLES):
            if len(rows) >= TARGET_ROWS:
                break

            friction, eff, gain = degradation_effects(health)
            friction *= run_friction_mult
            eff *= run_eff_mult

            # 2) Supply fluctuation: voltage drifts 11.2V -> 12.8V over time, scaled by Vscale
            V = voltage_with_drift(global_time) * Vscale
            t, current, speed = simulate_cycle(V, load, friction)

            # 3) Environmental temperature cycle
            ambient = ambient_temperature(global_time)
            temp = temperature_model(current, eff, ambient)
            vib = vibration_model(speed, gain, run_vib_baseline_mult)
            flow = flow_model(speed, eff)

            for k in range(len(t)):
                if len(rows) >= TARGET_ROWS:
                    break

                health = update_health(health, current[k], temp[k])
                rul = health / 100 * MAX_RUL
                label = label_state(health)

                # Raw sensor values (before systematic errors)
                c, v, f = current[k], vib[k], flow[k]
                # 5) Sudden disturbances
                c, v, f = maybe_add_spike(c, v, f)

                # 1) Sensor offset & scaling error (what the "sensor" actually outputs)
                c_sensor = c + CURRENT_OFFSET_A
                t_sensor = temp[k] + TEMP_BIAS_C
                v_sensor = v * VIBRATION_GAIN_ERROR

                rows.append([
                    global_time,
                    c_sensor,
                    t_sensor,
                    v_sensor,
                    f,
                    health,
                    rul,
                    label
                ])
                global_time += DT

        if len(rows) >= TARGET_ROWS:
            break
    if len(rows) >= TARGET_ROWS:
        break

# ==========================
# SAVE
# ==========================

df = pd.DataFrame(rows, columns=[
    "time", "current", "temperature", "vibration", "flow", "health", "rul", "label"
])
df = df.head(TARGET_ROWS)
out_file = "LEVEL1_LEVEL2_PUMP_DATASET_IMPROVED.csv"
df.to_csv(out_file, index=False)

print("\nDataset generated with realism (5 effects applied).")
print("Rows:", len(df))
print("File:", out_file)
print("Columns:", list(df.columns))
print("\nEffects: 1) Sensor offset/gain  2) Voltage drift  3) Ambient cycles  4) Run randomness  5) Spikes")
