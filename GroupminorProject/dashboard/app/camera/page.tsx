'use client'

import { useEffect, useState } from 'react'
import { getSensorData, createWebSocketConnection, type SensorData } from '@/lib/api'

export default function CameraPage() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSensorData()
        setSensorData(data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }

    fetchData()

    const ws = createWebSocketConnection(
      (data: SensorData) => setSensorData(data),
      () => {},
      () => {}
    )

    return () => {
      if (ws && ws.close) {
        ws.close()
      }
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">SMART IRRIGATION DIGITAL TWIN - Live Camera</h1>

        <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
          <div className="relative">
            <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video mb-4">
              <img 
                src={process.env.NEXT_PUBLIC_CAMERA_URL || '/api/placeholder/1200/800'} 
                alt="Live irrigation camera feed"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Overlay Status */}
            {sensorData && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white px-4 py-3 rounded-lg flex justify-between">
                <div className="flex items-center gap-2">
                  <span>💧</span>
                  <span>Flow Rate: {sensorData.flow_rate_Lmin.toFixed(1)} L/min</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <span>Tank Level: {Math.round((sensorData.tank_level_cm / 50) * 100)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
