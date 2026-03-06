import { useState, useEffect } from "react";
import { Link } from "react-router";
import { DigitalTwin3D } from "../components/DigitalTwin3D";
import { ArrowLeft, Power } from "lucide-react";
import { Button } from "../components/ui/button";
import { turnPumpOn, turnPumpOff, getTwinState } from "../../lib/api";
import { Toaster, toast } from "sonner";

export function DigitalTwinPage() {
  const [pumpOn, setPumpOn] = useState(false);
  const [pumpLoading, setPumpLoading] = useState(false);

  // Sync pump state from API
  useEffect(() => {
    const sync = async () => {
      try {
        const twin = await getTwinState();
        if (twin) setPumpOn(twin.pumpOn ?? false);
      } catch {}
    };
    sync();
    const id = setInterval(sync, 2000);
    return () => clearInterval(id);
  }, []);

  const handlePumpToggle = async () => {
    setPumpLoading(true);
    try {
      if (pumpOn) {
        await turnPumpOff();
        setPumpOn(false);
        toast.success("Pump stopped");
      } else {
        await turnPumpOn();
        setPumpOn(true);
        toast.success("Pump started");
      }
    } catch (e) {
      toast.error("Backend unavailable", {
        description: "Start the backend: cd backend && node index.js",
      });
    } finally {
      setPumpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Toaster />
      {/* Compact header with back link and pump control */}
      <header className="bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900">3D Digital Twin - Irrigation System</h1>
          <Button
            onClick={handlePumpToggle}
            disabled={pumpLoading}
            variant={pumpOn ? "default" : "outline"}
            className={pumpOn ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Power className="w-4 h-4 mr-2" />
            {pumpOn ? "Pump ON" : "Pump OFF"}
          </Button>
        </div>
      </header>

      {/* Full-height 3D canvas area */}
      <main className="flex-1 min-h-0 p-4">
        <DigitalTwin3D fullPage />
      </main>
    </div>
  );
}
