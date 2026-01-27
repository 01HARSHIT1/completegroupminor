'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface SensorData {
  timestamp: string
  vibration: number
  temperature: number
  current: number
  flowRate: number
  tankLevel: number
  ph: number
  turbidity: number
}

export default function DashboardPage() {
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [currentReadings, setCurrentReadings] = useState<SensorData | null>(null)

  useEffect(() => {
    // Simulate real-time data
    const generateData = () => {
      const now = new Date()
      const newData: SensorData = {
        timestamp: now.toLocaleTimeString(),
        vibration: 0.5 + Math.random() * 0.5,
        temperature: 35 + Math.random() * 5,
        current: 2 + Math.random() * 1,
        flowRate: 8 + Math.random() * 2,
        tankLevel: 25 + Math.random() * 5,
        ph: 7 + (Math.random() - 0.5) * 0.5,
        turbidity: 45 + Math.random() * 10,
      }
      
      setCurrentReadings(newData)
      setSensorData(prev => [...prev.slice(-20), newData])
    }

    generateData()
    const interval = setInterval(generateData, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Live Dashboard</h1>

        {/* Current Readings */}
        {currentReadings && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <MetricCard title="Vibration" value={`${currentReadings.vibration.toFixed(2)} g`} unit="RMS" />
            <MetricCard title="Temperature" value={`${currentReadings.temperature.toFixed(1)}°C`} unit="Motor" />
            <MetricCard title="Current" value={`${currentReadings.current.toFixed(2)} A`} unit="Load" />
            <MetricCard title="Flow Rate" value={`${currentReadings.flowRate.toFixed(1)} L/min`} unit="Water" />
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Vibration Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="vibration" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Temperature Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Current & Flow Rate">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} name="Current (A)" />
                <Line yAxisId="right" type="monotone" dataKey="flowRate" stroke="#22c55e" strokeWidth={2} name="Flow (L/min)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Water Quality">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="ph" stroke="#8b5cf6" strokeWidth={2} name="pH" />
                <Line yAxisId="right" type="monotone" dataKey="turbidity" stroke="#f59e0b" strokeWidth={2} name="Turbidity (NTU)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </main>
  )
}

function MetricCard({ title, value, unit }: { title: string; value: string; unit: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{unit}</p>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  )
}
