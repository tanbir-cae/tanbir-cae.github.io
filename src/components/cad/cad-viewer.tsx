"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Grid,
  Layers,
  Sliders,
  Box,
  Download,
  Info,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CadViewerProps {
  modelUrl?: string | null;
  modelFormat?: string | null;
  assemblyName?: string;
  nativeDownloadUrl?: string | null;
  nativeFileName?: string | null;
  className?: string;
  autoRotate?: boolean;
}

interface ComponentNode {
  id: string;
  name: string;
  material: string;
  meshName: string;
  visible: boolean;
  color: number;
}

export function CadViewer({
  modelUrl,
  modelFormat,
  assemblyName = "Epicyclic Planetary Gearbox Assembly",
  nativeDownloadUrl,
  nativeFileName = "planetary_gearbox_assembly.sldasm",
  className = "",
  autoRotate = false,
}: CadViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [renderMode, setRenderMode] = useState<"solid" | "wireframe" | "technical">("solid");
  const [showGrid, setShowGrid] = useState(true);
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [showTree, setShowTree] = useState(false);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [components, setComponents] = useState<ComponentNode[]>([]);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);

  // Procedural gear geometry generator
  const createGearMesh = (
    teeth: number,
    pitchRadius: number,
    width: number,
    holeRadius: number,
    color: number,
    name: string
  ) => {
    const shape = new THREE.Shape();
    const toothDepth = pitchRadius * 0.18;
    const totalPoints = teeth * 4;

    for (let i = 0; i <= totalPoints; i++) {
      const angle = (i / totalPoints) * Math.PI * 2;
      const mod = i % 4;
      const r = mod === 1 || mod === 2 ? pitchRadius + toothDepth : pitchRadius - toothDepth;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }

    const hole = new THREE.Path();
    hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: width,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.8,
      bevelThickness: 0.8,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      metalness: 0.75,
      roughness: 0.28,
      wireframe: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  // Build default planetary assembly
  const buildPlanetaryAssembly = useCallback(() => {
    const assemblyGroup = new THREE.Group();
    assemblyGroup.name = "assembly_root";

    const parts: ComponentNode[] = [];

    // 1. Sun Gear (Center)
    const sun = createGearMesh(16, 20, 14, 6, 0xe58a2b, "sun_gear");
    sun.position.set(0, 0, 0);
    assemblyGroup.add(sun);
    parts.push({
      id: "part-sun",
      name: "Sun Gear (Z=16)",
      material: "AISI 4340 Case Hardened",
      meshName: "sun_gear",
      visible: true,
      color: 0xe58a2b,
    });

    // 2. Planet Carrier (Triangular drive plate)
    const carrierShape = new THREE.Shape();
    const cRadius = 36;
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3;
      const x = Math.cos(a) * cRadius;
      const y = Math.sin(a) * cRadius;
      if (i === 0) carrierShape.moveTo(x, y);
      else carrierShape.lineTo(x, y);
    }
    carrierShape.closePath();
    const carrierGeom = new THREE.ExtrudeGeometry(carrierShape, { depth: 6, bevelEnabled: true, bevelThickness: 0.5 });
    carrierGeom.center();
    const carrierMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.35 });
    const carrier = new THREE.Mesh(carrierGeom, carrierMat);
    carrier.position.set(0, 0, -12);
    carrier.name = "planet_carrier";
    assemblyGroup.add(carrier);
    parts.push({
      id: "part-carrier",
      name: "Planet Carrier Plate",
      material: "Forged 6061-T6 Aluminum",
      meshName: "planet_carrier",
      visible: true,
      color: 0x64748b,
    });

    // 3. Planet Gears (3x spaced 120°)
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3;
      const pDist = 38;
      const pMesh = createGearMesh(14, 18, 12, 4, 0x159a9c, `planet_gear_${i + 1}`);
      pMesh.position.set(Math.cos(angle) * pDist, Math.sin(angle) * pDist, 0);
      assemblyGroup.add(pMesh);
      parts.push({
        id: `part-planet-${i + 1}`,
        name: `Planet Satellite #${i + 1} (Z=14)`,
        material: "Case Hardened 4340 Alloy",
        meshName: `planet_gear_${i + 1}`,
        visible: true,
        color: 0x159a9c,
      });
    }

    // 4. Ring Gear / Casing
    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, 72, 0, Math.PI * 2, false);
    const ringHole = new THREE.Path();
    ringHole.absarc(0, 0, 56, 0, Math.PI * 2, true);
    ringShape.holes.push(ringHole);
    const ringGeom = new THREE.ExtrudeGeometry(ringShape, { depth: 22, bevelEnabled: true, bevelThickness: 1 });
    ringGeom.center();
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x1f4e79,
      metalness: 0.8,
      roughness: 0.25,
      transparent: true,
      opacity: 0.85,
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.position.set(0, 0, 0);
    ringMesh.name = "ring_casing";
    assemblyGroup.add(ringMesh);
    parts.push({
      id: "part-ring",
      name: "Ring Gear Outer Casing (Z=46)",
      material: "Structural Alloy Steel Casing",
      meshName: "ring_casing",
      visible: true,
      color: 0x1f4e79,
    });

    // 5. Input & Output Shafts
    const shaftGeom = new THREE.CylinderGeometry(5, 5, 50, 24);
    shaftGeom.rotateX(Math.PI / 2);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.15 });
    const shaft = new THREE.Mesh(shaftGeom, shaftMat);
    shaft.position.set(0, 0, 10);
    shaft.name = "drive_shaft";
    assemblyGroup.add(shaft);
    parts.push({
      id: "part-shaft",
      name: "Input Drive Shaft Ø10mm",
      material: "Ground 4140 Chromoly",
      meshName: "drive_shaft",
      visible: true,
      color: 0x94a3b8,
    });

    setComponents(parts);
    return assemblyGroup;
  }, []);

  // Update exploded view factor
  const applyExplode = useCallback(
    (factor: number) => {
      setExplodeFactor(factor);
      if (!rootGroupRef.current) return;

      rootGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.name === "sun_gear") {
            child.position.z = factor * 40;
          } else if (child.name === "planet_carrier") {
            child.position.z = -12 - factor * 35;
          } else if (child.name.startsWith("planet_gear")) {
            const idx = parseInt(child.name.split("_")[2], 10) - 1;
            const angle = (idx * 2 * Math.PI) / 3;
            const baseDist = 38;
            const expandedDist = baseDist + factor * 25;
            child.position.x = Math.cos(angle) * expandedDist;
            child.position.y = Math.sin(angle) * expandedDist;
            child.position.z = factor * 10;
          } else if (child.name === "ring_casing") {
            child.position.z = factor * 15;
          } else if (child.name === "drive_shaft") {
            child.position.z = 10 + factor * 50;
          }
        }
      });
    },
    []
  );

  // Toggle component visibility
  const toggleVisibility = (meshName: string) => {
    if (!rootGroupRef.current) return;
    const mesh = rootGroupRef.current.getObjectByName(meshName);
    if (mesh) {
      mesh.visible = !mesh.visible;
      setComponents((prev) =>
        prev.map((c) => (c.meshName === meshName ? { ...c, visible: mesh.visible } : c))
      );
    }
  };

  // Reset Camera View
  const resetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(90, 80, 110);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  }, []);

  // Fit to screen
  const fitToScreen = useCallback(() => {
    if (!rootGroupRef.current || !cameraRef.current || !controlsRef.current) return;
    const box = new THREE.Box3().setFromObject(rootGroupRef.current);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = cameraRef.current.fov * (Math.PI / 180);
    let cameraZ = Math.abs((maxDim / 2) / Math.tan(fov / 2));
    cameraZ *= 1.6;

    cameraRef.current.position.set(center.x + cameraZ * 0.7, center.y + cameraZ * 0.6, center.z + cameraZ * 0.8);
    controlsRef.current.target.copy(center);
    controlsRef.current.update();
  }, []);

  // Update render mode
  useEffect(() => {
    if (!rootGroupRef.current) return;
    rootGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (renderMode === "wireframe") {
          mat.wireframe = true;
          mat.color.set(0x38bdf8);
        } else if (renderMode === "technical") {
          mat.wireframe = false;
          mat.metalness = 0.1;
          mat.roughness = 0.9;
          mat.color.set(0x1e3a8a);
        } else {
          // Solid
          mat.wireframe = false;
          mat.metalness = 0.75;
          mat.roughness = 0.3;
          const orig = components.find((c) => c.meshName === child.name);
          if (orig) mat.color.set(orig.color);
        }
      }
    });
  }, [renderMode, components]);

  // Main Three.js Init
  useEffect(() => {
    const container = containerRef.current;
    const canvasContainer = canvasContainerRef.current;
    if (!container || !canvasContainer) return;

    // Dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(90, 80, 110);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    canvasContainer.innerHTML = "";
    canvasContainer.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 500;
    controls.minDistance = 20;
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 1.5;
    controlsRef.current = controls;

    // Lighting (Studio Engineering 3-Point Setup)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(80, 120, 90);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    fillLight.position.set(-80, -40, -60);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xe58a2b, 0.5);
    rimLight.position.set(0, -100, 80);
    scene.add(rimLight);

    // Engineering Datum Grid & Axes
    const grid = new THREE.GridHelper(160, 32, 0x1f4e79, 0x1e293b);
    grid.position.y = -35;
    scene.add(grid);
    gridHelperRef.current = grid;

    const axes = new THREE.AxesHelper(30);
    axes.position.set(-60, -35, -60);
    scene.add(axes);
    axesHelperRef.current = axes;

    // Model Loading logic
    const loadModel = async () => {
      setLoading(true);
      if (modelUrl) {
        try {
          if (modelFormat === "stl" || modelUrl.endsWith(".stl")) {
            const stlLoader = new STLLoader();
            stlLoader.load(
              modelUrl,
              (geometry) => {
                geometry.center();
                geometry.computeVertexNormals();
                const material = new THREE.MeshStandardMaterial({
                  color: 0x159a9c,
                  metalness: 0.7,
                  roughness: 0.3,
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                const group = new THREE.Group();
                group.add(mesh);
                scene.add(group);
                rootGroupRef.current = group;
                setLoading(false);
                fitToScreen();
              },
              undefined,
              () => {
                // Fallback on error
                const group = buildPlanetaryAssembly();
                scene.add(group);
                rootGroupRef.current = group;
                setLoading(false);
              }
            );
          } else {
            // GLTF / GLB
            const gltfLoader = new GLTFLoader();
            gltfLoader.load(
              modelUrl,
              (gltf) => {
                const group = gltf.scene;
                scene.add(group);
                rootGroupRef.current = group;
                setLoading(false);
                fitToScreen();
              },
              undefined,
              () => {
                const group = buildPlanetaryAssembly();
                scene.add(group);
                rootGroupRef.current = group;
                setLoading(false);
              }
            );
          }
        } catch {
          const group = buildPlanetaryAssembly();
          scene.add(group);
          rootGroupRef.current = group;
          setLoading(false);
        }
      } else {
        // No custom model URL: render interactive procedural planetary gearbox
        const group = buildPlanetaryAssembly();
        scene.add(group);
        rootGroupRef.current = group;
        setLoading(false);
      }
    };

    loadModel();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      renderer.dispose();
      if (canvasContainer.contains(renderer.domElement)) {
        canvasContainer.removeChild(renderer.domElement);
      }
    };
  }, [buildPlanetaryAssembly, fitToScreen, isRotating, modelFormat, modelUrl]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-xl border border-border bg-[#0a0f1d] shadow-2xl transition-all ${
        isFullscreen ? "fixed inset-0 z-50 h-screen w-screen rounded-none" : "h-[540px]"
      } ${className}`}
    >
      {/* Dedicated Three.js Canvas Container */}
      <div ref={canvasContainerRef} className="absolute inset-0 z-0 pointer-events-auto" />

      {/* Top Header Overlay */}
      <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="border-cyan-500/40 bg-slate-950/80 font-mono text-xs text-cyan-400 backdrop-blur-md">
          <Box className="mr-1.5 h-3.5 w-3.5" />
          WebGL 3D CAD
        </Badge>
        <div className="rounded-md bg-slate-950/80 px-2.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-md">
          {assemblyName}
        </div>
      </div>

      {/* Top Right Actions */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5">
        {nativeDownloadUrl && (
          <a
            href={nativeDownloadUrl}
            download={nativeFileName}
            className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900/90 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-500 hover:bg-slate-800 transition-colors backdrop-blur-md"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">SolidWorks Asset</span>
          </a>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="h-8 border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white backdrop-blur-md"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Component Tree Sidebar Drawer */}
      {showTree && (
        <div className="absolute left-4 top-16 z-20 w-72 rounded-lg border border-slate-700 bg-slate-950/90 p-3 shadow-xl backdrop-blur-md text-xs text-slate-300 transition-all">
          <div className="mb-2 flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-semibold tracking-wider text-slate-100 uppercase">Assembly Tree</span>
            <span className="font-mono text-[10px] text-cyan-400">{components.length} parts</span>
          </div>
          <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
            {components.map((comp) => (
              <div
                key={comp.id}
                onClick={() => setSelectedCompId(comp.id)}
                className={`flex items-center justify-between rounded p-1.5 transition-colors cursor-pointer ${
                  selectedCompId === comp.id ? "bg-cyan-950/60 border border-cyan-500/40" : "hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: `#${comp.color.toString(16).padStart(6, "0")}` }}
                  />
                  <span className="truncate font-medium text-slate-200">{comp.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(comp.meshName);
                  }}
                  className="text-slate-400 hover:text-white"
                  title={comp.visible ? "Hide Part" : "Show Part"}
                >
                  {comp.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-slate-600" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Controls Toolbar */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-950/85 px-3 py-2 shadow-2xl backdrop-blur-md">
        {/* Reset Camera */}
        <button
          onClick={resetCamera}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
          title="Reset Camera"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Fit Model */}
        <button
          onClick={fitToScreen}
          className="flex h-8 px-2 items-center gap-1 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
          title="Fit Model to Viewport"
        >
          Fit
        </button>

        <div className="h-4 w-[1px] bg-slate-800" />

        {/* Shading Mode */}
        <div className="flex items-center gap-1 bg-slate-900/90 rounded-lg p-0.5 border border-slate-800 text-[11px]">
          <button
            onClick={() => setRenderMode("solid")}
            className={`rounded px-2 py-1 transition-colors ${
              renderMode === "solid" ? "bg-cyan-600 text-white font-medium shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Shaded
          </button>
          <button
            onClick={() => setRenderMode("wireframe")}
            className={`rounded px-2 py-1 transition-colors ${
              renderMode === "wireframe" ? "bg-cyan-600 text-white font-medium shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Wire
          </button>
          <button
            onClick={() => setRenderMode("technical")}
            className={`rounded px-2 py-1 transition-colors ${
              renderMode === "technical" ? "bg-cyan-600 text-white font-medium shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Blueprint
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-800" />

        {/* Explode Assembly Slider */}
        <div className="flex items-center gap-2 px-1">
          <Sliders className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden sm:inline text-[11px] font-mono text-slate-400">Explode</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={explodeFactor}
            onChange={(e) => applyExplode(parseFloat(e.target.value))}
            className="h-1.5 w-20 sm:w-28 cursor-pointer accent-cyan-400"
            title="Explode Assembly"
          />
        </div>

        <div className="h-4 w-[1px] bg-slate-800" />

        {/* Grid Toggle */}
        <button
          onClick={() => {
            const next = !showGrid;
            setShowGrid(next);
            if (gridHelperRef.current) gridHelperRef.current.visible = next;
            if (axesHelperRef.current) axesHelperRef.current.visible = next;
          }}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            showGrid ? "text-cyan-400 bg-cyan-950/50" : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
          }`}
          title="Toggle Datum Grid"
        >
          <Grid className="h-4 w-4" />
        </button>

        {/* Parts Tree Toggle */}
        <button
          onClick={() => setShowTree((prev) => !prev)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            showTree ? "text-cyan-400 bg-cyan-950/50" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
          title="Toggle Parts Tree"
        >
          <Layers className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Hint Overlay bottom left */}
      <div className="absolute bottom-4 left-4 z-10 hidden md:block text-[11px] font-mono text-slate-500 bg-slate-950/60 px-2.5 py-1 rounded backdrop-blur-sm pointer-events-none">
        Left Click: Rotate · Right Click: Pan · Scroll: Zoom
      </div>

      {/* Loading state overlay */}
      {loading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="mt-3 font-mono text-xs text-cyan-400">Initializing WebGL CAD Viewport...</p>
        </div>
      )}
    </div>
  );
}
