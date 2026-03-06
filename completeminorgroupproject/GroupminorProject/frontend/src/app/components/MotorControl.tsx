import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Power, PlayCircle, StopCircle, AlertTriangle, Timer } from "lucide-react";
import { motion } from "motion/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface MotorControlProps {
  isRunning: boolean;
  onToggle: (state: boolean) => void;
  runningDuration: number; // in seconds
}

export function MotorControl({ isRunning, onToggle, runningDuration }: MotorControlProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<"start" | "stop" | null>(null);

  const handleSwitchChange = (checked: boolean) => {
    setPendingAction(checked ? "start" : "stop");
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (pendingAction) {
      onToggle(pendingAction === "start");
    }
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const handleEmergencyStop = () => {
    onToggle(false);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Card className="p-6 border-2 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className={`${isRunning ? "bg-green-500" : "bg-gray-400"} p-3 rounded-lg transition-colors`}>
            <Power className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Motor Control</h3>
            <p className="text-sm text-gray-600">Remote pump operation</p>
          </div>
        </div>

        {/* Main Control Section */}
        <div className="flex flex-col items-center justify-center py-8 mb-6">
          <motion.div
            className={`relative mb-6 ${isRunning ? "animate-pulse" : ""}`}
            animate={isRunning ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div
              className={`w-40 h-40 rounded-full flex items-center justify-center border-8 ${
                isRunning
                  ? "bg-gradient-to-br from-green-400 to-green-600 border-green-300"
                  : "bg-gradient-to-br from-gray-300 to-gray-400 border-gray-200"
              } shadow-2xl relative`}
            >
              {isRunning && (
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-green-400"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.8, 0, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              )}
              <Power className="w-20 h-20 text-white" />
            </div>
          </motion.div>

          <div className="flex items-center gap-4 mb-6">
            <span className={`text-sm font-medium ${!isRunning ? "text-gray-900" : "text-gray-400"}`}>OFF</span>
            <Switch checked={isRunning} onCheckedChange={handleSwitchChange} className="scale-150" />
            <span className={`text-sm font-medium ${isRunning ? "text-green-700" : "text-gray-400"}`}>ON</span>
          </div>

          <div
            className={`text-center mb-4 px-6 py-3 rounded-lg ${
              isRunning ? "bg-green-100 border-2 border-green-300" : "bg-gray-100 border-2 border-gray-300"
            }`}
          >
            <div className="text-2xl font-bold mb-1">{isRunning ? "RUNNING" : "STOPPED"}</div>
            <div className="text-sm text-gray-600">
              {isRunning ? "Irrigation in progress" : "Press ON to start irrigation"}
            </div>
          </div>

          {/* Running Duration */}
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200"
            >
              <Timer className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-xs text-blue-600 font-medium">Running Duration</div>
                <div className="text-lg font-bold text-blue-800">{formatDuration(runningDuration)}</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={isRunning ? "outline" : "default"}
            size="lg"
            onClick={() => {
              if (!isRunning) {
                setPendingAction("start");
                setShowConfirmDialog(true);
              }
            }}
            disabled={isRunning}
            className="h-14"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Start Irrigation
          </Button>

          <Button
            variant={isRunning ? "default" : "outline"}
            size="lg"
            onClick={() => {
              if (isRunning) {
                setPendingAction("stop");
                setShowConfirmDialog(true);
              }
            }}
            disabled={!isRunning}
            className="h-14"
          >
            <StopCircle className="w-5 h-5 mr-2" />
            Stop Irrigation
          </Button>
        </div>

        {/* Emergency Stop */}
        {isRunning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <Button
              variant="destructive"
              size="lg"
              onClick={handleEmergencyStop}
              className="w-full h-14 bg-red-600 hover:bg-red-700"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              EMERGENCY STOP
            </Button>
          </motion.div>
        )}
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction === "start" ? "Start Irrigation System?" : "Stop Irrigation System?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === "start"
                ? "This will turn ON the motor and start the irrigation process. Please ensure the system is ready."
                : "This will turn OFF the motor and stop the irrigation process. Are you sure you want to proceed?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={pendingAction === "start" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {pendingAction === "start" ? "Start Motor" : "Stop Motor"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
