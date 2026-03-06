# Project Folder Structure

## Keep ONLY These 6 Folders

| Folder | Full Path | Purpose |
|--------|-----------|---------|
| **frontend** | `C:\CodeData\completeminorgroupproject\GroupminorProject\frontend\` | Dashboard (Vite+React), port 5173 |
| **backend** | `C:\CodeData\completeminorgroupproject\GroupminorProject\backend\` | Central API, port 5000 |
| **babylon** | `C:\CodeData\completeminorgroupproject\GroupminorProject\babylon\` | Digital twin backend, port 5004 |
| **esp** | `C:\CodeData\completeminorgroupproject\GroupminorProject\esp\` | ESP32 firmware |
| **ml-models** | `C:\CodeData\completeminorgroupproject\GroupminorProject\ml-models\` | ML API, port 5001 |
| **pump_dataset_generator** | `C:\CodeData\completeminorgroupproject\GroupminorProject\pump_dataset_generator\` | Pump Health API, port 5003 |

## Remove Extra Folders

Run **after closing all dev servers and terminals**:
```powershell
cd C:\CodeData\completeminorgroupproject\GroupminorProject
.\DELETE_OLD_DESIGNFRONTCODE.ps1
```
This removes: dashboard, designfrontcode, .vscode, and any other folder not in the list above.
