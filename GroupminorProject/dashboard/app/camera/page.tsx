'use client'

import { useState } from 'react'
import { Camera, RefreshCw } from 'lucide-react'

export default function CameraPage() {
  const [isLoading, setIsLoading] = useState(false)
  const cameraUrl = process.env.NEXT_PUBLIC_CAMERA_URL || 'http://your-camera-ip:8080/stream'

  const refreshStream = () => {
    setIsLoading(true)
    // Force refresh camera stream
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Live Camera Feed</h1>
          <button
            onClick={refreshStream}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh Stream
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white">Loading camera feed...</div>
              </div>
            ) : (
              <img
                src={cameraUrl}
                alt="Live irrigation camera feed"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23333" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="white" font-size="24"%3ECamera Feed Unavailable%3C/text%3E%3C/svg%3E'
                }}
              />
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Camera Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Camera Type:</span>
                <span className="ml-2 font-semibold">ESP32-CAM</span>
              </div>
              <div>
                <span className="text-gray-600">Resolution:</span>
                <span className="ml-2 font-semibold">640x480</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-semibold text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
