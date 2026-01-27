'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Prediction {
  condition: string
  conditionCode: number
  confidence: number
  failureProbability: number
  healthScore: number
  performanceEfficiency: number
  alerts: string[]
  recommendations: string[]
}

export default function PredictionsPage() {
  const [prediction, setPrediction] = useState<Prediction>({
    condition: 'Normal',
    conditionCode: 0,
    confidence: 0.95,
    failureProbability: 0.05,
    healthScore: 92,
    performanceEfficiency: 88,
    alerts: [],
    recommendations: ['System operating normally', 'Continue regular monitoring'],
  })

  useEffect(() => {
    // Simulate ML prediction updates
    const interval = setInterval(() => {
      // In production, this would fetch from ML API
      const conditions = ['Normal', 'Leakage Detected', 'Blockage Suspected', 'Failure Risk High']
      const randomCondition = conditions[Math.floor(Math.random() * 4)]
      
      setPrediction({
        condition: randomCondition,
        conditionCode: conditions.indexOf(randomCondition),
        confidence: 0.85 + Math.random() * 0.1,
        failureProbability: randomCondition === 'Failure Risk High' ? 0.3 + Math.random() * 0.2 : Math.random() * 0.1,
        healthScore: randomCondition === 'Normal' ? 90 + Math.random() * 5 : 70 + Math.random() * 10,
        performanceEfficiency: 80 + Math.random() * 15,
        alerts: randomCondition !== 'Normal' ? [`⚠️ ${randomCondition}`] : [],
        recommendations: getRecommendations(randomCondition),
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getRecommendations = (condition: string): string[] => {
    switch (condition) {
      case 'Leakage Detected':
        return ['Check irrigation pipes for leaks', 'Inspect connection points', 'Monitor water level closely']
      case 'Blockage Suspected':
        return ['Clean irrigation pipes', 'Check drip channels', 'Inspect filter system']
      case 'Failure Risk High':
        return ['Schedule maintenance immediately', 'Reduce pump load', 'Monitor temperature closely']
      default:
        return ['System operating normally', 'Continue regular monitoring']
    }
  }

  const getStatusColor = (code: number) => {
    switch (code) {
      case 0: return 'text-green-600 bg-green-50'
      case 1: return 'text-yellow-600 bg-yellow-50'
      case 2: return 'text-orange-600 bg-orange-50'
      case 3: return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (code: number) => {
    switch (code) {
      case 0: return <CheckCircle className="w-6 h-6" />
      case 1: return <AlertCircle className="w-6 h-6" />
      case 2: return <AlertTriangle className="w-6 h-6" />
      case 3: return <XCircle className="w-6 h-6" />
      default: return <AlertCircle className="w-6 h-6" />
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">ML Predictions & Alerts</h1>

        {/* Main Prediction Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Current System Status</h2>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusColor(prediction.conditionCode)}`}>
              {getStatusIcon(prediction.conditionCode)}
              <span className="font-semibold">{prediction.condition}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <PredictionMetric
              title="Health Score"
              value={`${Math.round(prediction.healthScore)}%`}
              color={prediction.healthScore > 80 ? 'text-green-600' : prediction.healthScore > 60 ? 'text-yellow-600' : 'text-red-600'}
            />
            <PredictionMetric
              title="Performance Efficiency"
              value={`${Math.round(prediction.performanceEfficiency)}%`}
              color="text-blue-600"
            />
            <PredictionMetric
              title="Failure Probability"
              value={`${(prediction.failureProbability * 100).toFixed(1)}%`}
              color={prediction.failureProbability > 0.2 ? 'text-red-600' : 'text-green-600'}
            />
            <PredictionMetric
              title="Confidence"
              value={`${(prediction.confidence * 100).toFixed(1)}%`}
              color="text-purple-600"
            />
          </div>
        </div>

        {/* Alerts */}
        {prediction.alerts.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Active Alerts
            </h3>
            <ul className="space-y-2">
              {prediction.alerts.map((alert, index) => (
                <li key={index} className="text-red-700">{alert}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {prediction.recommendations.map((rec, index) => (
              <li key={index} className="text-blue-700 flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prediction Details */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Prediction Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Condition Code:</span>
              <span className="ml-2 font-semibold">{prediction.conditionCode}</span>
            </div>
            <div>
              <span className="text-gray-600">Model Confidence:</span>
              <span className="ml-2 font-semibold">{(prediction.confidence * 100).toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-gray-600">Last Updated:</span>
              <span className="ml-2 font-semibold">{new Date().toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Prediction Model:</span>
              <span className="ml-2 font-semibold">Random Forest + LSTM</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function PredictionMetric({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
