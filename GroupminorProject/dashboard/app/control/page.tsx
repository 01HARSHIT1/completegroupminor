'use client'

import { useState, useEffect } from 'react'
import { getSensorData, getPumpStatus, turnPumpOn, turnPumpOff, createWebSocketConnection, type SensorData } from '@/lib/api'
import { Power, Clock, Calendar } from 'lucide-react'

export default function ControlPage() {
  const [pumpStatus, setPumpStatus] = useState<'ON' | 'OFF'>('OFF')
  const [sensorData, setSensorData] = useState<SensorData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [status, sensors] = await Promise.all([
          getPumpStatus(),
          getSensorData()
        ])
        setPumpStatus(status.pump_status as 'ON' | 'OFF')
        setSensorData(sensors)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }

    fetchData()

    const ws = createWebSocketConnection(
      (data: SensorData) => setSensorData(data),
      () => {},
      (status: { status: string }) => setPumpStatus(status.status as 'ON' | 'OFF')
    )

    return () => ws.close()
  }, [])

  const handlePumpToggle = async () => {
    setIsLoading(true)
    try {
      if (pumpStatus === 'ON') {
        await turnPumpOff()
        setPumpStatus('OFF')
      } else {
        await turnPumpOn()
        setPumpStatus('ON')
      }
    } catch (error) {
      console.error('Failed to toggle pump:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">SMART IRRIGATION DIGITAL TWIN - Controls</h1>

        <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
          {/* Pump Control Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handlePumpToggle}
              disabled={isLoading}
              className={`flex-1 px-6 py-4 rounded-lg font-bold text-white transition-all ${
                pumpStatus === 'ON'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:opacity-50`}
            >
              {isLoading ? 'Processing...' : pumpStatus === 'ON' ? 'PUMP OFF' : 'PUMP ON'}
            </button>
          </div>

          {/* Current Readings */}
          {sensorData && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white mb-2">
                  <span>💧</span>
                  <span className="font-semibold">Current Flow</span>
                </div>
                <p className="text-2xl font-bold text-white">{sensorData.flow_rate_Lmin.toFixed(1)} L/min</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white mb-2">
                  <span>🌡️</span>
                  <span className="font-semibold">Motor Temp</span>
                </div>
                <p className="text-2xl font-bold text-white">{sensorData.temperature_C.toFixed(1)} °C</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white mb-2">
                  <span>💧</span>
                  <span className="font-semibold">Water Level</span>
                </div>
                <p className="text-2xl font-bold text-white">{Math.round((sensorData.tank_level_cm / 50) * 100)}%</p>
              </div>
            </div>
          )}

          {/* Scheduling Options */}
          <div className="flex gap-4">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              Set Timer
            </button>
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              Irrigation Schedule
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
