'use client'

import { useState } from 'react'
import { Power, Play, Square } from 'lucide-react'

export default function ControlPage() {
  const [pumpStatus, setPumpStatus] = useState<'ON' | 'OFF'>('OFF')
  const [isLoading, setIsLoading] = useState(false)

  const togglePump = async () => {
    setIsLoading(true)
    // In production, this would call the API to control the pump
    setTimeout(() => {
      setPumpStatus(prev => prev === 'ON' ? 'OFF' : 'ON')
      setIsLoading(false)
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Pump Control</h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 ${
              pumpStatus === 'ON' ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Power className={`w-16 h-16 ${
                pumpStatus === 'ON' ? 'text-green-600' : 'text-gray-400'
              }`} />
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Pump Status: <span className={pumpStatus === 'ON' ? 'text-green-600' : 'text-gray-600'}>
                {pumpStatus}
              </span>
            </h2>

            <p className="text-gray-600 mb-8">
              {pumpStatus === 'ON' 
                ? 'Pump is currently running and delivering water to irrigation system'
                : 'Pump is currently stopped'}
            </p>

            <button
              onClick={togglePump}
              disabled={isLoading}
              className={`px-8 py-4 rounded-lg font-semibold text-white transition-all ${
                pumpStatus === 'ON'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : pumpStatus === 'ON' ? (
                <>
                  <Square className="w-5 h-5" />
                  Turn Pump OFF
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Turn Pump ON
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Control Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Remote control via mobile app and web dashboard</p>
              <p>• Pump status is synchronized across all devices</p>
              <p>• Safety checks are performed before pump activation</p>
              <p>• Automatic shutdown on fault detection</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
