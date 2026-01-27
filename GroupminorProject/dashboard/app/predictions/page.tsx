'use client'

import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { getPredictions, createWebSocketConnection, type Prediction } from '@/lib/api'
import { AlertTriangle } from 'lucide-react'

export default function PredictionsPage() {
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [failureHistory, setFailureHistory] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pred = await getPredictions()
        setPrediction(pred)
      } catch (error) {
        console.error('Failed to fetch predictions:', error)
      }
    }

    fetchData()

    const ws = createWebSocketConnection(
      () => {},
      (pred: Prediction) => {
        setPrediction(pred)
        setFailureHistory(prev => [...prev.slice(-20), {
          time: new Date().toLocaleTimeString(),
          probability: pred.failure_probability * 100
        }])
      },
      () => {}
    )

    return () => {
      if (ws && ws.close) {
        ws.close()
      }
    }
  }, [])

  if (!prediction) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">SMART IRRIGATION DIGITAL TWIN - Predictions</h1>

        <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
          {/* Pump Health Stats */}
          <div className="mb-6">
            <h2 className="text-white font-semibold mb-4">Pump Health:</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-600 text-white px-4 py-3 rounded-lg text-center">
                <p className="text-2xl font-bold">{Math.round(prediction.health_score)}%</p>
                <p className="text-sm">Health Score</p>
              </div>
              <div className="bg-green-600 text-white px-4 py-3 rounded-lg text-center">
                <p className="text-2xl font-bold">{Math.round(prediction.performance_efficiency)}%</p>
                <p className="text-sm">Efficiency</p>
              </div>
              <div className="bg-blue-600 text-white px-4 py-3 rounded-lg text-center">
                <p className="text-2xl font-bold">3-5 Hours</p>
                <p className="text-sm">Est. Time</p>
              </div>
            </div>
          </div>

          {/* Failure Probability Chart */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-2">Failure Probability:</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={failureHistory}>
                <Area 
                  type="monotone" 
                  dataKey="probability" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3} 
                />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Alerts */}
          <div className="space-y-3">
            {prediction.leakage_detected && (
              <div className="bg-orange-600 text-white px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>⚠ Leakage Detected:</span>
              </div>
            )}
            {prediction.blockage_detected && (
              <div className="bg-orange-600 text-white px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>⚠ Blockage Suspected:</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
