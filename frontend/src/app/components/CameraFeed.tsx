import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Video, Maximize, Camera, CheckCircle, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface CameraFeedProps {
  isOnline: boolean;
  streamUrl?: string;
}

export function CameraFeed({ isOnline }: CameraFeedProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Live Field View</h3>
              <div className="flex items-center gap-2 mt-1">
                {isOnline ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Camera Online</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700 font-medium">Camera Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Snapshot
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)}>
              <Maximize className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
          </div>
        </div>

        {/* Video Feed Container */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
          {isOnline ? (
            <>
              {/* Simulated Video Feed */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-900">
                <div className="absolute inset-0 opacity-30">
                  <motion.div
                    className="absolute top-1/3 left-1/4 w-32 h-32 bg-green-600 rounded-full blur-3xl"
                    animate={{
                      x: [0, 50, 0],
                      y: [0, 30, 0],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute top-1/2 right-1/3 w-40 h-40 bg-green-500 rounded-full blur-3xl"
                    animate={{
                      x: [0, -40, 0],
                      y: [0, 40, 0],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                {/* Field illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/90">
                    <div className="text-6xl mb-4">🌾</div>
                    <div className="text-lg font-medium">Live Irrigation Field</div>
                    <div className="text-sm text-green-200 mt-2">Water Pump Active</div>
                  </div>
                </div>
              </div>

              {/* Live Indicator */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{
                    opacity: [1, 0.3, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                />
                <span className="text-sm font-semibold">LIVE</span>
              </div>

              {/* Timestamp */}
              <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-sm font-mono">
                {new Date().toLocaleTimeString()}
              </div>

              {/* Info Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>📍 North Field - Sector A</span>
                  <span>🌡️ 28°C</span>
                  <span>💧 Active</span>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <Video className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">Camera Feed Unavailable</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Live Field View - Fullscreen</DialogTitle>
          </DialogHeader>
          <div className="relative bg-gray-900 rounded-lg overflow-hidden h-full">
            {/* Same content as above but larger */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-900">
              <div className="absolute inset-0 opacity-30">
                <motion.div
                  className="absolute top-1/3 left-1/4 w-64 h-64 bg-green-600 rounded-full blur-3xl"
                  animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/90">
                  <div className="text-9xl mb-6">🌾</div>
                  <div className="text-3xl font-medium">Live Irrigation Field</div>
                  <div className="text-xl text-green-200 mt-4">Water Pump Active</div>
                </div>
              </div>
            </div>
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full">
              <motion.div
                className="w-3 h-3 bg-white rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="font-semibold">LIVE</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}