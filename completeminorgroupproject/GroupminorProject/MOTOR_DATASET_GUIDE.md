# Step-by-Step Guide: Motor Dataset with Python → CSV

**Goal:** Create a realistic motor dataset with **Current, Vibration, Temperature, Health, RUL, Label** and save it as `motor_dataset.csv`.

Follow the steps **in order**. Do not skip.

---

## STEP 0 — Install Python

1. **Download Python** (3.10–3.12 recommended):  
   https://www.python.org/downloads/

2. **During install:**  
   ✔ Tick **"Add Python to PATH"**

3. **Verify:** Open a new terminal and run:
   ```bash
   python --version
   ```
   You should see something like `Python 3.10.x` or `Python 3.12.x`.

---

## STEP 1 — Create Project Folder

1. Create a new folder (e.g. on your Desktop or inside your project):
   ```
   motor_digital_twin
   ```

2. **Open terminal inside this folder:**
   - **Windows:** In File Explorer, go to `motor_digital_twin`, type `cmd` in the address bar and press Enter, or right‑click → "Open in Terminal".
   - **Mac/Linux:** `cd path/to/motor_digital_twin`

---

## STEP 2 — Install Required Libraries

Run this command **once** (inside `motor_digital_twin`):

```bash
pip install numpy scipy pandas matplotlib tqdm
```

Or use the requirements file (if you have one in the folder):

```bash
pip install -r requirements.txt
```

Wait until all packages are installed.

---

## STEP 3 — Create Physics Motor Simulator

1. Inside `motor_digital_twin`, create a file named:
   ```
   motor_physics.py
   ```

2. Paste this code and save:

```python
import numpy as np
from scipy.integrate import solve_ivp

# Realistic 12V DC motor parameters
R = 2.2
L = 0.45
Ke = 0.08
Kt = 0.08
J = 0.02
B = 0.002

def motor_model(t, x, V, TL):
    i, w = x
    di = (V - R*i - Ke*w) / L
    dw = (Kt*i - B*w - TL) / J
    return [di, dw]

def simulate_motor(V, TL, t_end=20, dt=0.01):
    t_eval = np.arange(0, t_end, dt)
    sol = solve_ivp(motor_model, [0, t_end], [0, 0], t_eval=t_eval, args=(V, TL))
    current = sol.y[0]
    speed = sol.y[1]
    return t_eval, current, speed
```

---

## STEP 4 — Create Sensor Behaviour (Realistic Noise)

1. Create a file named:
   ```
   sensor_model.py
   ```

2. Paste this code and save:

```python
import numpy as np

def current_sensor(i):
    noise = np.random.normal(0, 0.05, len(i))
    drift = np.linspace(0, 0.1, len(i))
    return i + noise + drift

def temperature_sensor(i):
    temp = 30 + 1.7 * (i ** 2)
    noise = np.random.normal(0, 0.5, len(i))
    return temp + noise

def vibration_sensor(speed, health):
    base = 1.2 + (1 - health / 100) * 5
    vib = base + 0.4 * np.sin(2 * np.pi * 120 * np.arange(len(speed)) * 0.01)
    noise = np.random.normal(0, 0.2, len(speed))
    return vib + noise
```

---

## STEP 5 — Create Motor Aging Model

1. Create a file named:
   ```
   degradation.py
   ```

2. Paste this code and save:

```python
def update_health(health, current, temp, dt):
    health -= 0.4 * dt
    health -= 0.02 * (current / 8)
    health -= 0.02 * (temp / 150)
    if health < 0:
        health = 0
    return health

def label_health(health):
    if health > 70:
        return 0
    elif health > 30:
        return 1
    else:
        return 2
```

---

## STEP 6 — Create Dataset Generator (Main Program)

1. Create a file named:
   ```
   generate_dataset.py
   ```

2. Paste this code and save:

```python
import pandas as pd
from motor_physics import simulate_motor
from sensor_model import current_sensor, temperature_sensor, vibration_sensor
from degradation import update_health, label_health
import numpy as np
from tqdm import tqdm

data = []
run_id = 0

voltages = [10, 12, 14, 16]
loads = [0.01, 0.05, 0.1]

for V in tqdm(voltages, desc="Voltage"):
    for TL in loads:
        run_id += 1
        health = 100

        t, current_true, speed = simulate_motor(V, TL)

        current = current_sensor(current_true)
        temp = temperature_sensor(current)

        for k in range(len(t)):
            health = update_health(health, current[k], temp[k], 0.01)
            vibration = vibration_sensor(speed[k : k + 1], health)[0]

            RUL = health / 100 * 500
            label = label_health(health)

            data.append([
                run_id, t[k], V, TL, current[k], speed[k], temp[k],
                vibration, health, RUL, label
            ])

df = pd.DataFrame(data, columns=[
    "RunID", "Time", "Voltage", "Torque", "Current", "Speed",
    "Temperature", "Vibration", "Health", "RUL", "Label"
])

df.to_csv("motor_dataset.csv", index=False)
print("Dataset created: motor_dataset.csv")
print(f"Rows: {len(df)}")
```

---

## STEP 7 — Run Dataset Generator

1. In the terminal, make sure you are inside `motor_digital_twin`.
2. Run:

```bash
python generate_dataset.py
```

3. Wait about **10–30 seconds**. You should see:
   ```
   Dataset created: motor_dataset.csv
   Rows: 240000
   ```
   (Row count may vary slightly.)

---

## STEP 8 — Check the Dataset

1. Open the file:
   ```
   motor_dataset.csv
   ```
   (in Excel, Notepad, or any CSV viewer.)

2. You should see columns like:

| Column       | Meaning                    |
|-------------|----------------------------|
| RunID       | Simulation run identifier  |
| Time        | Time (s)                    |
| Voltage     | Supply voltage (V)          |
| Torque      | Load torque                 |
| **Current** | Motor electrical load (A)  |
| **Speed**   | Shaft rotation (rad/s)      |
| **Temperature** | Heating (°C)           |
| **Vibration**   | Mechanical wear         |
| **Health**  | Motor condition (0–100)     |
| **RUL**     | Remaining useful life       |
| **Label**   | 0=Healthy, 1=Warning, 2=Fault |

---

## You’re Done

You now have a **realistic predictive-maintenance motor dataset** in `motor_dataset.csv`.

---

## Next Steps (Later)

- **Feature engineering** (e.g. rolling means, variance, trends).
- **LSTM (or other model) training** for RUL or label prediction.
- **Hardware calibration** so real sensor data matches these units/ranges.

---

## Windows PowerShell

If you use PowerShell, use `;` instead of `&&` to chain commands:

```powershell
cd motor_digital_twin; pip install -r requirements.txt; python generate_dataset.py
```

---

## Troubleshooting

| Problem              | What to do |
|----------------------|------------|
| `python` not found    | Reinstall Python and tick "Add Python to PATH", or use `py` instead of `python`. |
| `No module named 'scipy'` | Run `pip install numpy scipy pandas tqdm`. |
| Script runs but no CSV | Check you are in the same folder as `generate_dataset.py`; the CSV is created in the current directory. |
| Too slow             | Reduce `t_end` in `simulate_motor` (e.g. 5 instead of 20) or use fewer voltage/load combinations for a smaller dataset. |

---

**Summary:** Install Python → create `motor_digital_twin` → install libs → add the 4 Python files → run `python generate_dataset.py` → use `motor_dataset.csv`.
