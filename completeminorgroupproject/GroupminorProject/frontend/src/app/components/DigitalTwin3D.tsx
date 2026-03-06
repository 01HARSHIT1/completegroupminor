/**
 * Babylon.js 3D Digital Twin - Smart Irrigation System
 * Professional industrial visualization with shadows, materials, and lighting.
 */

import { useEffect, useRef, useState } from "react";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  ShadowGenerator,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  PBRMaterial,
  Color3,
  Color4,
  AbstractMesh,
  Animation,
} from "@babylonjs/core";
import { getTwinState, type TwinState } from "../../lib/api";
import { Card } from "./ui/card";

const SCALE = 1;

function createProfessionalBox(
  scene: Scene,
  name: string,
  size: { w: number; h: number; d: number },
  position: Vector3,
  color: Color3,
  opts?: { metallic?: number; roughness?: number; emissive?: Color3 }
): AbstractMesh {
  const box = MeshBuilder.CreateBox(name, { width: size.w, height: size.h, depth: size.d }, scene);
  box.position = position;
  const mat = new StandardMaterial(`${name}Mat`, scene);
  mat.diffuseColor = color;
  mat.specularColor = new Color3(0.4, 0.4, 0.45);
  mat.specularPower = opts?.metallic ? 128 : 64;
  if (opts?.emissive) mat.emissiveColor = opts.emissive;
  mat.alpha = 1;
  box.material = mat;
  return box;
}

function createMetallicCylinder(
  scene: Scene,
  name: string,
  height: number,
  diameter: number,
  position: Vector3,
  color: Color3
): AbstractMesh {
  const cyl = MeshBuilder.CreateCylinder(name, { height, diameter }, scene);
  cyl.position = position;
  const mat = new PBRMaterial(`${name}Mat`, scene);
  mat.albedoColor = color;
  mat.metallic = 0.85;
  mat.roughness = 0.25;
  mat.environmentIntensity = 1.2;
  cyl.material = mat;
  return cyl;
}

function createTube(
  scene: Scene,
  name: string,
  path: Vector3[],
  diameter: number,
  color: Color3
): AbstractMesh {
  const tube = MeshBuilder.CreateTube(name, { path, radius: diameter / 2 }, scene);
  const mat = new StandardMaterial(`${name}Mat`, scene);
  mat.diffuseColor = color;
  mat.specularColor = new Color3(0.3, 0.3, 0.35);
  mat.specularPower = 32;
  tube.material = mat;
  return tube;
}

interface DigitalTwin3DProps {
  fullPage?: boolean;
}

export function DigitalTwin3D({ fullPage = false }: DigitalTwin3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [twinState, setTwinState] = useState<TwinState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const pumpMotorRef = useRef<AbstractMesh | null>(null);

  // Poll twin state every 2 seconds
  useEffect(() => {
    const fetchTwin = async () => {
      try {
        const state = await getTwinState();
        setTwinState(state);
        setError(null);
      } catch (e) {
        setError("Twin API unavailable");
      }
    };
    fetchTwin();
    const id = setInterval(fetchTwin, 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.92, 0.94, 0.98, 1);
    sceneRef.current = scene;

    // Camera
    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      14,
      new Vector3(0, 2, 0),
      scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.wheelPrecision = 25;
    camera.minZ = 0.1;

    // Ground plane - professional workbench surface
    const ground = MeshBuilder.CreateGround("ground", { width: 24, height: 12 }, scene);
    ground.position = new Vector3(0, 0, 0);
    const groundMat = new StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new Color3(0.75, 0.78, 0.82);
    groundMat.specularColor = new Color3(0.15, 0.15, 0.18);
    groundMat.specularPower = 32;
    ground.material = groundMat;
    ground.receiveShadows = true;

    // Lighting - professional 3-point setup
    const hemi = new HemisphericLight(
      "hemi",
      new Vector3(0, 1, 0),
      scene
    );
    hemi.intensity = 0.6;
    hemi.diffuse = new Color3(0.95, 0.97, 1);
    hemi.groundColor = new Color3(0.4, 0.45, 0.5);

    const dirLight = new DirectionalLight(
      "dirLight",
      new Vector3(-2, -4, -2),
      scene
    );
    dirLight.position = new Vector3(8, 12, 8);
    dirLight.intensity = 1.2;
    dirLight.diffuse = new Color3(1, 0.98, 0.95);

    const fillLight = new HemisphericLight(
      "fill",
      new Vector3(-1, 0.5, 0.5),
      scene
    );
    fillLight.intensity = 0.35;

    // Shadows
    const shadowGen = new ShadowGenerator(1024, dirLight);
    shadowGen.useBlurExponentialShadowMap = true;
    shadowGen.blurKernel = 16;

    // === LAYOUT ===
    const allMeshes: AbstractMesh[] = [];

    // 1. Laptop
    const laptop = createProfessionalBox(
      scene, "laptop",
      { w: 2.5 * SCALE, h: 0.2 * SCALE, d: 1.8 * SCALE },
      new Vector3(-5, 1.5, 0),
      new Color3(0.18, 0.18, 0.22),
      { metallic: 0.3 }
    );
    allMeshes.push(laptop);

    // 2. ESP32
    const esp32 = createProfessionalBox(
      scene, "esp32",
      { w: 0.8 * SCALE, h: 0.08 * SCALE, d: 0.5 * SCALE },
      new Vector3(-2.5, 1.2, 0),
      new Color3(0.12, 0.45, 0.22)
    );
    allMeshes.push(esp32);

    // 3. Breadboard
    const breadboard = createProfessionalBox(
      scene, "breadboard",
      { w: 2.2 * SCALE, h: 0.1 * SCALE, d: 1.2 * SCALE },
      new Vector3(0, 1, 0),
      new Color3(0.88, 0.84, 0.72)
    );
    allMeshes.push(breadboard);

    // 4. Sensors
    const currentSensor = createProfessionalBox(
      scene, "currentSensor",
      { w: 0.4, h: 0.15, d: 0.3 },
      new Vector3(-0.6, 1.15, 0.4),
      new Color3(0.85, 0.25, 0.18)
    );
    const vibrationSensor = createProfessionalBox(
      scene, "vibrationSensor",
      { w: 0.4, h: 0.15, d: 0.3 },
      new Vector3(0, 1.15, 0.4),
      new Color3(0.2, 0.5, 0.82)
    );
    const tempSensor = createProfessionalBox(
      scene, "tempSensor",
      { w: 0.4, h: 0.15, d: 0.3 },
      new Vector3(0.6, 1.15, 0.4),
      new Color3(0.9, 0.52, 0.18)
    );
    allMeshes.push(currentSensor, vibrationSensor, tempSensor);

    // 5. Power adapter
    const adapter = createProfessionalBox(
      scene, "adapter",
      { w: 0.6 * SCALE, h: 0.4 * SCALE, d: 0.4 * SCALE },
      new Vector3(2.5, 0.8, -0.5),
      new Color3(0.28, 0.28, 0.32)
    );
    allMeshes.push(adapter);

    // 6. Water pump motor - metallic
    const pumpMotor = createMetallicCylinder(
      scene, "pumpMotor",
      0.5 * SCALE, 0.6 * SCALE,
      new Vector3(3.5, 1, 0),
      new Color3(0.35, 0.38, 0.42)
    );
    pumpMotorRef.current = pumpMotor;
    allMeshes.push(pumpMotor);

    // 7. Flow sensor
    const flowSensor = createProfessionalBox(
      scene, "flowSensor",
      { w: 0.5, h: 0.3, d: 0.4 },
      new Vector3(4.5, 1, 0.3),
      new Color3(0.15, 0.65, 0.48)
    );
    allMeshes.push(flowSensor);

    // 8. Pipe
    const pipe = createTube(scene, "pipe", [
      new Vector3(3.5, 1, 0.3),
      new Vector3(4, 1, 0.3),
      new Vector3(4.5, 1, 0.3),
    ], 0.15, new Color3(0.35, 0.55, 0.75));

    // 9. AIML display - dark with subtle emissive
    const aimlDisplay = createProfessionalBox(
      scene, "aimlDisplay",
      { w: 1.5 * SCALE, h: 0.15 * SCALE, d: 1 * SCALE },
      new Vector3(5.5, 1.5, 0),
      new Color3(0.08, 0.12, 0.18),
      { emissive: new Color3(0.02, 0.04, 0.06) }
    );
    allMeshes.push(aimlDisplay);

    allMeshes.forEach((m) => { m.receiveShadows = true; shadowGen.addShadowCaster(m); });

    // Connection wires (simple tubes)
    createTube(
      scene,
      "wireLaptopEsp",
      [new Vector3(-4, 1.4, 0), new Vector3(-2.5, 1.25, 0)],
      0.04,
      new Color3(0.5, 0.5, 0.5)
    );
    createTube(
      scene,
      "wireEspBread",
      [new Vector3(-2.1, 1.15, 0), new Vector3(-1.2, 1.05, 0)],
      0.04,
      new Color3(0.5, 0.5, 0.5)
    );
    createTube(
      scene,
      "wireBreadAdapter",
      [new Vector3(1.2, 1.05, -0.2), new Vector3(2.2, 0.9, -0.4)],
      0.04,
      new Color3(0.5, 0.5, 0.5)
    );
    createTube(
      scene,
      "wireAdapterPump",
      [new Vector3(2.8, 0.9, -0.3), new Vector3(3.2, 1, 0)],
      0.04,
      new Color3(0.5, 0.5, 0.5)
    );

    // Pump rotation animation (when pump is ON)
    const pumpAnim = new Animation(
      "pumpRot",
      "rotation.y",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    pumpAnim.setKeys([
      { frame: 0, value: 0 },
      { frame: 60, value: Math.PI * 2 },
    ]);
    pumpMotor.animations = [pumpAnim];

    const runRenderLoop = () => {
      engine.runRenderLoop(() => {
        scene.render();
      });
    };

    runRenderLoop();

    const handleResize = () => engine.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      scene.dispose();
      engine.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Update pump animation based on twin state
  useEffect(() => {
    const scene = sceneRef.current;
    const pump = pumpMotorRef.current;
    if (!scene || !pump) return;

    const pumpOn = twinState?.pumpOn ?? false;
    if (pumpOn) {
      scene.beginAnimation(pump, 0, 60, true);
    } else {
      scene.stopAnimation(pump);
    }
  }, [twinState?.pumpOn]);

  const content = (
    <>
      {!fullPage && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">3D Digital Twin - Irrigation System</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className={twinState?.pumpOn ? "text-green-600 font-medium" : "text-gray-500"}>
              Pump: {twinState?.pumpOn ? "ON" : "OFF"}
            </span>
            <span>Flow: {twinState?.sensors?.flow_rate_Lmin?.toFixed(1) ?? "—"} L/min</span>
            <span>Health: {twinState?.health?.condition ?? "—"}</span>
          </div>
        </div>
      )}
      {error && (
        <p className="text-amber-600 text-sm mb-2">
          {error} — Run <code className="bg-gray-100 px-1">.\START_ALL.ps1</code> from GroupminorProject to start backend + Babylon.
        </p>
      )}
      <div
        className={`relative overflow-hidden bg-slate-100 ${fullPage ? "rounded-lg h-full min-h-[500px]" : ""}`}
        style={fullPage ? undefined : { height: 420 }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
          aria-label="3D Digital Twin"
        />
        <div className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
          Drag to rotate • Scroll to zoom • Laptop → ESP32 → Breadboard → Sensors → Pump → Flow → AIML
        </div>
        {fullPage && (
          <div className="absolute top-2 right-2 flex gap-3 text-sm bg-white/90 px-3 py-2 rounded shadow">
            <span className={twinState?.pumpOn ? "text-green-600 font-medium" : "text-gray-500"}>
              Pump: {twinState?.pumpOn ? "ON" : "OFF"}
            </span>
            <span>Flow: {twinState?.sensors?.flow_rate_Lmin?.toFixed(1) ?? "—"} L/min</span>
            <span>Health: {twinState?.health?.condition ?? "—"}</span>
          </div>
        )}
      </div>
    </>
  );

  if (fullPage) {
    return <div className="h-full min-h-[calc(100vh-120px)]">{content}</div>;
  }

  return (
    <Card className="p-4 overflow-hidden">
      {content}
    </Card>
  );
}
