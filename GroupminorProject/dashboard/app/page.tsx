'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, Droplet, AlertTriangle, Camera, Settings } from 'lucide-react'
import { getSensorData, getPredictions, createWebSocketConnection, type SensorData, type Prediction } from '@/lib/api'

interface SystemStatus {
  pumpStatus: 'ON' | 'OFF'
  healthScore: number
  condition: string
  alerts: number
}

export default function Home() {
  const [status, setStatus] = useState<SystemStatus>({
    pumpStatus: 'OFF',
    healthScore: 95,
    condition: 'Normal',
    alerts: 0,
  })

  useEffect(() => {
    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        const [sensorData, prediction] = await Promise.all([
          getSensorData(),
          getPredictions()
        ])
        
        setStatus({
          pumpStatus: sensorData.pump_status,
          healthScore: Math.round(prediction.health_score),
          condition: prediction.condition,
          alerts: prediction.alerts.length,
        })
      } catch (error) {
        console.error('Failed to fetch initial data:', error)
      }
    }

    fetchInitialData()

    // WebSocket connection for real-time updates
    const ws = createWebSocketConnection(
      (sensorData: SensorData) => {
        setStatus(prev => ({
          ...prev,
          pumpStatus: sensorData.pump_status,
        }))
      },
      (prediction: Prediction) => {
        setStatus({
          pumpStatus: status.pumpStatus,
          healthScore: Math.round(prediction.health_score),
          condition: prediction.condition,
          alerts: prediction.alerts.length,
        })
      },
      (pumpStatus: { status: string }) => {
        setStatus(prev => ({
          ...prev,
          pumpStatus: pumpStatus.status as 'ON' | 'OFF',
        }))
      }
    )

    return () => {
      ws.close()
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Smart Irrigation Digital Twin
          </h1>
          <p className="text-gray-600">
            Real-time monitoring and predictive maintenance system
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatusCard
            title="Pump Status"
            value={status.pumpStatus}
            icon={<Activity className="w-6 h-6" />}
            color={status.pumpStatus === 'ON' ? 'text-green-600' : 'text-gray-600'}
          />
          <StatusCard
            title="Health Score"
            value={`${Math.round(status.healthScore)}%`}
            icon={<Droplet className="w-6 h-6" />}
            color={status.healthScore > 80 ? 'text-green-600' : 'text-orange-600'}
          />
          <StatusCard
            title="Condition"
            value={status.condition}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="text-blue-600"
          />
          <StatusCard
            title="Active Alerts"
            value={status.alerts.toString()}
            icon={<AlertTriangle className="w-6 h-6" />}
            color={status.alerts > 0 ? 'text-red-600' : 'text-gray-600'}
          />
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <NavCard
            href="/dashboard"
            title="Live Dashboard"
            description="Real-time sensor data and pump status"
            icon={<Activity className="w-8 h-8" />}
          />
          <NavCard
            href="/analytics"
            title="Analytics"
            description="Historical data and performance graphs"
            icon={<Droplet className="w-8 h-8" />}
          />
          <NavCard
            href="/predictions"
            title="Predictions"
            description="ML-based fault detection and alerts"
            icon={<AlertTriangle className="w-8 h-8" />}
          />
          <NavCard
            href="/camera"
            title="Camera Feed"
            description="Live irrigation monitoring"
            icon={<Camera className="w-8 h-8" />}
          />
          <NavCard
            href="/control"
            title="Pump Control"
            description="Remote pump ON/OFF control"
            icon={<Settings className="w-8 h-8" />}
          />
        </div>
      </div>
    </main>
  )
}

function StatusCard({ title, value, icon, color }: {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={color}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  )
}

function NavCard({ href, title, description, icon }: {
  href: string
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="text-green-600 mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  )
}
