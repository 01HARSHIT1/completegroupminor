'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getSensorData, getPredictions, createWebSocketConnection, type SensorData, type Prediction } from '@/lib/api'
import { AlertTriangle } from 'lucide-react'

export default function DashboardPage() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [historicalData, setHistoricalData] = useState<any[]>([])

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const [sensor, pred] = await Promise.all([
          getSensorData(),
          getPredictions()
        ])
        setSensorData(sensor)
        setPrediction(pred)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }

    fetchData()

    // WebSocket for real-time updates
    const ws = createWebSocketConnection(
      (data: SensorData) => {
        setSensorData(data)
        // Add to historical data
        setHistoricalData(prev => [...prev.slice(-50), {
          time: new Date().toLocaleTimeString(),
          vibration: data.vibration_rms,
          temperature: data.temperature_C,
          current: data.current_A,
          flow: data.flow_rate_Lmin
        }])
      },
      (pred: Prediction) => setPrediction(pred),
      () => {}
    )

    return () => ws.close()
  }, [])

  if (!sensorData || !prediction) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">SMART IRRIGATION DIGITAL TWIN - Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Main Dashboard */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
            {/* Pump Status Badge */}
            <div className="mb-4">
              <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                sensorData.pump_status === 'ON' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 text-white'
              }`}>
                Pump Status: {sensorData.pump_status}
              </span>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Water Flow</p>
                <p className="text-3xl font-bold text-white">{sensorData.flow_rate_Lmin.toFixed(1)} L/min</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Tank Level</p>
                <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                  <div 
                    className="bg-green-500 h-4 rounded-full transition-all"
                    style={{ width: `${(sensorData.tank_level_cm / 50) * 100}%` }}
                  ></div>
                </div>
                <p className="text-white font-semibold">{Math.round((sensorData.tank_level_cm / 50) * 100)}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Motor Health</p>
                <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                  <div 
                    className="bg-green-500 h-4 rounded-full transition-all"
                    style={{ width: `${prediction.health_score}%` }}
                  ></div>
                </div>
                <p className="text-white font-semibold">{Math.round(prediction.health_score)}%</p>
              </div>
            </div>

            {/* Circular Gauges */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Gauge 
                label="Flow Rate" 
                value={sensorData.flow_rate_Lmin.toFixed(1)} 
                unit="L/min"
                color="green"
                max={30}
              />
              <Gauge 
                label="Motor Temp" 
                value={sensorData.temperature_C.toFixed(1)} 
                unit="°C"
                color="orange"
                max={100}
              />
              <Gauge 
                label="Current" 
                value={sensorData.current_A.toFixed(1)} 
                unit="A"
                color="red"
                max={10}
              />
            </div>

            {/* Live Camera Feed */}
            <div className="mb-4">
              <h3 className="text-white font-semibold mb-2">Live Farm Camera</h3>
              <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <img 
                  src={process.env.NEXT_PUBLIC_CAMERA_URL || '/api/placeholder/600/400'} 
                  alt="Live farm feed"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Alerts */}
            {prediction.alerts.length > 0 && (
              <div className="space-y-2">
                {prediction.alerts.map((alert, idx) => (
                  <div key={idx} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Analytics */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">SMART IRRIGATION DIGITAL TWIN - Analytics</h2>
            
            {/* Alert Summary Cards */}
            <div className="space-y-3 mb-6">
              {prediction.leakage_detected && (
                <div className="bg-blue-600 text-white px-4 py-3 rounded-lg">
                  <span className="font-semibold">▲ Leakage Detected:</span> Water Loss in Pipeline
                </div>
              )}
              {prediction.blockage_detected && (
                <div className="bg-orange-600 text-white px-4 py-3 rounded-lg">
                  <span className="font-semibold">▲ Blockage Suspected:</span> Low Flow Detected
                </div>
              )}
              {prediction.failure_probability > 0.2 && (
                <div className="bg-red-600 text-white px-4 py-3 rounded-lg">
                  <span className="font-semibold">❗ Failure Risk:</span> High Vibration & Heat
                </div>
              )}
            </div>

            {/* Trend Graphs */}
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-2">Vibration Analysis</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={historicalData}>
                    <Area type="monotone" dataKey="vibration" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">Temperature Trend</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={historicalData}>
                    <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">Flow Rate</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={historicalData}>
                    <Area type="monotone" dataKey="flow" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">Current Usage</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={historicalData}>
                    <Area type="monotone" dataKey="current" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function Gauge({ label, value, unit, color, max }: {
  label: string
  value: string
  unit: string
  color: 'green' | 'orange' | 'red' | 'blue'
  max: number
}) {
  const colorClasses = {
    green: 'text-green-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    blue: 'text-blue-400'
  }

  const numValue = parseFloat(value)
  const percentage = (numValue / max) * 100

  return (
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-2">
        <svg className="transform -rotate-90 w-20 h-20">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-700"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 36}`}
            strokeDashoffset={`${2 * Math.PI * 36 * (1 - percentage / 100)}`}
            className={colorClasses[color]}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${colorClasses[color]}`}>{value}</span>
        </div>
      </div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-gray-500 text-xs">{unit}</p>
    </div>
  )
}
