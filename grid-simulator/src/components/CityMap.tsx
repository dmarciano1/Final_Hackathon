"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import Map, { Layer, MapMouseEvent, MapRef } from "react-map-gl/mapbox";
import type { FillExtrusionLayer } from "mapbox-gl";
import { Canvas, coordsToVector3 } from "react-three-map";
import "mapbox-gl/dist/mapbox-gl.css";
import { useSimulationStore, GridNode, MAP_CENTER } from "../store/useSimulationStore";
import { useTheme } from "next-themes";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const ORIGIN = { latitude: MAP_CENTER.lat, longitude: MAP_CENTER.lng };
const INITIAL_IDS = new Set(['plant_1', 'sub_north', 'sub_south', 'sub_east', 'sub_west']);

const buildingsLayer: FillExtrusionLayer = {
  id: "3d-buildings",
  source: "composite",
  "source-layer": "building",
  filter: ["==", "extrude", "true"],
  type: "fill-extrusion",
  minzoom: 15,
  paint: {
    "fill-extrusion-color": "#1f2937",
    "fill-extrusion-height": [
      "interpolate", ["linear"], ["zoom"],
      15, 0, 15.05, ["get", "height"],
    ],
    "fill-extrusion-base": [
      "interpolate", ["linear"], ["zoom"],
      15, 0, 15.05, ["get", "min_height"],
    ],
    "fill-extrusion-opacity": 0.6,
  },
};

const NODE_SCALE = 40;

export default function CityMap() {
  const { nodes, placementMode, addNode, lastPlacedId } = useSimulationStore();
  const { theme } = useTheme();
  const mapRef = useRef<MapRef>(null);
  const prevPlacedId = useRef<string | null>(null);

  useEffect(() => {
    if (lastPlacedId && lastPlacedId !== prevPlacedId.current) {
      prevPlacedId.current = lastPlacedId;
      const node = nodes[lastPlacedId];
      if (!node) return;
      mapRef.current?.flyTo({
        center: [node.lng, node.lat],
        zoom: 17.5,
        pitch: 65,
        bearing: Math.random() * 40 - 20,
        duration: 1800,
        essential: true,
      });
      setTimeout(() => {
        mapRef.current?.flyTo({
          center: [node.lng, node.lat],
          zoom: 16,
          pitch: 60,
          bearing: 0,
          duration: 2200,
          essential: true,
        });
      }, 3000);
    }
  }, [lastPlacedId, nodes]);

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (!placementMode) return;
      addNode(placementMode, e.lngLat.lat, e.lngLat.lng);
    },
    [placementMode, addNode]
  );

  const lines = useMemo(() => {
    const pairs: [GridNode, GridNode][] = [];
    const seen = new Set<string>();
    Object.values(nodes).forEach((node) => {
      node.connections.forEach((targetId) => {
        const target = nodes[targetId];
        if (target) {
          const key = [node.id, target.id].sort().join("-");
          if (!seen.has(key)) {
            seen.add(key);
            pairs.push([node, target]);
          }
        }
      });
    });
    return pairs;
  }, [nodes]);

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: MAP_CENTER.lng,
        latitude: MAP_CENTER.lat,
        zoom: 16,
        pitch: 60,
        bearing: 0,
      }}
      mapStyle={theme === "dark" ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11"}
      terrain={{ source: "mapbox", exaggeration: 1 }}
      style={{ width: "100%", height: "100%" }}
      cursor={placementMode ? "crosshair" : undefined}
      onClick={handleMapClick}
    >
      <Layer {...buildingsLayer} />
      <Canvas latitude={MAP_CENTER.lat} longitude={MAP_CENTER.lng} altitude={0}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1} color="#aaccff" />
        <directionalLight position={[-5, 15, -5]} intensity={0.3} color="#ffccaa" />

        {Object.values(nodes).map((node) => (
          <CityNode key={node.id} node={node} isNew={node.id === lastPlacedId} />
        ))}

        {lines.map(([n1, n2], i) => (
          <TransmissionLine key={i} source={n1} target={n2} />
        ))}
      </Canvas>
    </Map>
  );
}

// ─── Drop-in animation wrapper ──────────────────────────────────────

function CityNode({ node, isNew }: { node: GridNode; isNew: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const animating = useRef(false);
  const scaleProgress = useRef(1);
  const wasNewRef = useRef(false);

  const shouldAnimate = isNew && !INITIAL_IDS.has(node.id);

  if (shouldAnimate && !wasNewRef.current) {
    scaleProgress.current = 0;
    animating.current = true;
  }
  wasNewRef.current = shouldAnimate;

  const pos = useMemo(
    () => coordsToVector3({ latitude: node.lat, longitude: node.lng }, ORIGIN) as [number, number, number],
    [node.lat, node.lng]
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (animating.current && scaleProgress.current < 1) {
      scaleProgress.current = Math.min(1, scaleProgress.current + delta * 1.8);
      const t = scaleProgress.current;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const bounce = ease > 0.8 ? 1 + (1 - ease) * 0.4 : ease;
      const s = bounce * NODE_SCALE;
      groupRef.current.scale.set(s, s, s);
      groupRef.current.position.set(pos[0], pos[1] + (1 - ease) * NODE_SCALE * 3, pos[2]);
      if (scaleProgress.current >= 1) {
        animating.current = false;
        groupRef.current.scale.set(NODE_SCALE, NODE_SCALE, NODE_SCALE);
        groupRef.current.position.set(pos[0], pos[1], pos[2]);
      }
    }
  });

  const initialScale = shouldAnimate && scaleProgress.current < 1
    ? 0.01
    : NODE_SCALE;

  return (
    <group
      ref={groupRef}
      position={pos}
      scale={[initialScale, initialScale, initialScale]}
    >
      <NodeModel node={node} />
    </group>
  );
}

// ─── Composite 3D models per type ───────────────────────────────────

function NodeModel({ node }: { node: GridNode }) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!materialRef.current) return;
    if (node.status === "offline") {
      materialRef.current.emissiveIntensity = 0;
    } else if (node.status === "warning" || node.status === "critical") {
      materialRef.current.emissiveIntensity = 0.5 + ((Math.sin(state.clock.elapsedTime * 5) + 1) / 2) * 1.5;
    } else {
      const loadRatio = node.capacity > 0 ? node.currentLoad / node.capacity : 0;
      materialRef.current.emissiveIntensity = 0.2 + loadRatio * ((Math.sin(state.clock.elapsedTime * 2) + 1) * 0.5);
    }
  });

  const { color, emissive } = getNodeColors(node);

  switch (node.type) {
    case "power_plant":
      return <PowerPlantModel color={color} emissive={emissive} matRef={materialRef} />;
    case "nuclear_plant":
      return <NuclearPlantModel color={color} emissive={emissive} matRef={materialRef} />;
    case "wind_farm":
      return <WindFarmModel color={color} emissive={emissive} matRef={materialRef} />;
    case "solar_farm":
      return <SolarFarmModel color={color} emissive={emissive} matRef={materialRef} />;
    case "hydro_plant":
      return <HydroPlantModel color={color} emissive={emissive} matRef={materialRef} />;
    case "substation":
      return <SubstationModel color={color} emissive={emissive} matRef={materialRef} />;
    case "battery_storage":
      return <BatteryStorageModel color={color} emissive={emissive} matRef={materialRef} />;
    case "microgrid":
      return <MicrogridModel color={color} emissive={emissive} matRef={materialRef} />;
    case "data_center":
      return <DataCenterModel color={color} emissive={emissive} matRef={materialRef} />;
    case "ev_charging_hub":
      return <EVChargingModel color={color} emissive={emissive} matRef={materialRef} />;
    case "hospital":
      return <HospitalModel color={color} emissive={emissive} matRef={materialRef} />;
    case "stadium":
      return <StadiumModel color={color} emissive={emissive} matRef={materialRef} />;
    default:
      return (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial ref={materialRef} color={color} emissive={emissive} emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      );
  }
}

function getNodeColors(node: GridNode) {
  if (node.status === "offline") return { color: "#1f2937", emissive: "#000000" };
  if (node.status === "critical") return { color: "#ef4444", emissive: "#dc2626" };
  if (node.status === "warning") return { color: "#facc15", emissive: "#ca8a04" };

  const colorMap: Record<string, { color: string; emissive: string }> = {
    power_plant: { color: "#f97316", emissive: "#ea580c" },
    nuclear_plant: { color: "#06b6d4", emissive: "#0891b2" },
    wind_farm: { color: "#60a5fa", emissive: "#3b82f6" },
    solar_farm: { color: "#fbbf24", emissive: "#f59e0b" },
    hydro_plant: { color: "#38bdf8", emissive: "#0ea5e9" },
    substation: { color: "#22d3ee", emissive: "#0891b2" },
    battery_storage: { color: "#10b981", emissive: "#047857" },
    microgrid: { color: "#34d399", emissive: "#059669" },
    data_center: { color: "#a855f7", emissive: "#7e22ce" },
    ev_charging_hub: { color: "#4ade80", emissive: "#16a34a" },
    hospital: { color: "#ef4444", emissive: "#dc2626" },
    stadium: { color: "#facc15", emissive: "#ca8a04" },
  };
  return colorMap[node.type] ?? { color: "#22d3ee", emissive: "#0891b2" };
}

// Shared material props
interface ModelProps {
  color: string;
  emissive: string;
  matRef: React.RefObject<THREE.MeshStandardMaterial>;
}

function Mat({ matRef, color, emissive, opacity }: ModelProps & { opacity?: number }) {
  return (
    <meshStandardMaterial
      ref={matRef}
      color={color}
      emissive={emissive}
      emissiveIntensity={0.5}
      toneMapped={false}
      transparent={opacity !== undefined}
      opacity={opacity}
    />
  );
}

function SecondaryMat({ color, emissive }: { color: string; emissive: string }) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={0.3}
      toneMapped={false}
    />
  );
}

// ─── Power Plant: main building + two cooling towers + chimney stack ──

function PowerPlantModel({ color, emissive, matRef }: ModelProps) {
  return (
    <group>
      {/* Main building */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[2.5, 1.2, 1.8]} />
        <Mat matRef={matRef} color={color} emissive={emissive} />
      </mesh>
      {/* Cooling tower 1 */}
      <mesh position={[-0.6, 1.8, 0.3]}>
        <cylinderGeometry args={[0.3, 0.5, 1.8, 12]} />
        <SecondaryMat color="#9ca3af" emissive="#6b7280" />
      </mesh>
      {/* Cooling tower 2 */}
      <mesh position={[0.6, 1.8, 0.3]}>
        <cylinderGeometry args={[0.3, 0.5, 1.8, 12]} />
        <SecondaryMat color="#9ca3af" emissive="#6b7280" />
      </mesh>
      {/* Chimney */}
      <mesh position={[0, 2.5, -0.5]}>
        <cylinderGeometry args={[0.12, 0.12, 2.2, 8]} />
        <SecondaryMat color="#71717a" emissive="#52525b" />
      </mesh>
      {/* Smoke glow */}
      <mesh position={[0, 3.7, -0.5]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// ─── Nuclear: containment dome + reactor building + cooling tower ────

function NuclearPlantModel({ color, emissive, matRef }: ModelProps) {
  return (
    <group>
      {/* Reactor containment dome */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[1.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Mat matRef={matRef} color={color} emissive={emissive} />
      </mesh>
      {/* Base cylinder */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.2, 1.3, 0.8, 16]} />
        <SecondaryMat color="#94a3b8" emissive="#64748b" />
      </mesh>
      {/* Cooling tower */}
      <mesh position={[2, 1.5, 0]}>
        <cylinderGeometry args={[0.4, 0.7, 3, 12]} />
        <SecondaryMat color="#9ca3af" emissive="#6b7280" />
      </mesh>
      {/* Aux building */}
      <mesh position={[-1.5, 0.4, 0]}>
        <boxGeometry args={[1, 0.8, 1.2]} />
        <SecondaryMat color="#64748b" emissive="#475569" />
      </mesh>
      {/* Radioactive glow ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 1.7, 24]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Wind Farm: 3 turbine towers with rotating blades ────────────────

function WindTurbine({ position }: { position: [number, number, number] }) {
  const bladesRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (bladesRef.current) bladesRef.current.rotation.z = state.clock.elapsedTime * 2;
  });

  return (
    <group position={position}>
      {/* Tower */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.06, 0.12, 4, 8]} />
        <SecondaryMat color="#e2e8f0" emissive="#94a3b8" />
      </mesh>
      {/* Nacelle */}
      <mesh position={[0, 4.1, 0]}>
        <boxGeometry args={[0.2, 0.15, 0.3]} />
        <SecondaryMat color="#cbd5e1" emissive="#94a3b8" />
      </mesh>
      {/* Blades */}
      <group ref={bladesRef} position={[0, 4.1, 0.2]}>
        {[0, 120, 240].map((deg) => (
          <mesh key={deg} rotation={[0, 0, (deg * Math.PI) / 180]} position={[0, 0.9, 0]}>
            <boxGeometry args={[0.06, 1.8, 0.02]} />
            <meshStandardMaterial color="#f1f5f9" emissive="#e2e8f0" emissiveIntensity={0.2} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function WindFarmModel({ color, emissive, matRef }: ModelProps) {
  return (
    <group>
      <WindTurbine position={[0, 0, 0]} />
      <WindTurbine position={[1.8, 0, -1]} />
      <WindTurbine position={[-1.8, 0, -0.5]} />
      {/* Ground pad glow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* Hidden mesh to drive the pulse material ref */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3, 24]} />
        <Mat matRef={matRef} color={color} emissive={emissive} opacity={0.15} />
      </mesh>
    </group>
  );
}

// ─── Solar Farm: angled panel rows ───────────────────────────────────

function SolarFarmModel({ color, emissive, matRef }: ModelProps) {
  const rows = [-1.2, -0.4, 0.4, 1.2];
  return (
    <group>
      {rows.map((z, i) => (
        <group key={i} position={[0, 0.3, z]}>
          <mesh rotation={[-0.5, 0, 0]} position={[0, 0.15, 0]}>
            <boxGeometry args={[2.8, 0.04, 0.6]} />
            {i === 0
              ? <Mat matRef={matRef} color="#1e3a5f" emissive={emissive} />
              : <SecondaryMat color="#1e3a5f" emissive={emissive} />
            }
          </mesh>
          {/* Panel frame legs */}
          <mesh position={[-1, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 4]} />
            <SecondaryMat color="#71717a" emissive="#52525b" />
          </mesh>
          <mesh position={[1, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 4]} />
            <SecondaryMat color="#71717a" emissive="#52525b" />
          </mesh>
        </group>
      ))}
      {/* Ground reflection */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.5, 3.5]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Hydro Plant: dam wall + water pool + turbine house ──────────────

function HydroPlantModel({ color, emissive, matRef }: ModelProps) {
  return (
    <group>
      {/* Dam wall */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[3.5, 1.6, 0.5]} />
        <SecondaryMat color="#94a3b8" emissive="#64748b" />
      </mesh>
      {/* Turbine house */}
      <mesh position={[0, 0.4, 0.6]}>
        <boxGeometry args={[1.5, 0.8, 0.8]} />
        <Mat matRef={matRef} color={color} emissive={emissive} />
      </mesh>
      {/* Water surface behind dam */}
      <mesh position={[0, 0.6, -1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.5, 2]} />
        <meshStandardMaterial color="#0c4a6e" emissive="#0369a1" emissiveIntensity={0.3} transparent opacity={0.6} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* Spillway grooves */}
      {[-0.8, 0, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0.3, 0.26]}>
          <boxGeometry args={[0.15, 0.6, 0.05]} />
          <SecondaryMat color="#78716c" emissive="#57534e" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Substation: transformer boxes + insulators + busbar ─────────────

function SubstationModel({ color, emissive, matRef }: ModelProps) {
  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[2.5, 0.2, 2]} />
        <SecondaryMat color="#374151" emissive="#1f2937" />
      </mesh>
      {/* Main transformer */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1, 0.8, 0.8]} />
        <Mat matRef={matRef} color={color} emissive={emissive} />
      </mesh>
      {/* Transformer fins */}
      {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.6, 0.45]}>
          <boxGeometry args={[0.03, 0.6, 0.08]} />
          <SecondaryMat color="#6b7280" emissive="#4b5563" />
        </mesh>
      ))}
      {/* Insulator columns */}
      {[[-0.8, 0.3], [0.8, 0.3], [-0.8, -0.3], [0.8, -0.3]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.2, z]}>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 6]} />
          <SecondaryMat color="#e2e8f0" emissive="#94a3b8" />
        </mesh>
      ))}
      {/* Busbars */}
      <mesh position={[0, 1.8, 0.3]}>
        <boxGeometry args={[2, 0.03, 0.03]} />
        <SecondaryMat color="#fbbf24" emissive="#f59e0b" />
      </mesh>
      <mesh position={[0, 1.8, -0.3]}>
        <boxGeometry args={[2, 0.03, 0.03]} />
        <SecondaryMat color="#fbbf24" emissive="#f59e0b" />
      </mesh>
    </group>
  );
}

// ─── Battery Storage: cells in a row with status lights ──────────────

function BatteryStorageModel({ color, emissive, matRef }: ModelProps) {
  return (
    <group>
      {/* Container base */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[3, 0.8, 1.2]} />
        <SecondaryMat color="#374151" emissive="#1f2937" />
      </mesh>
      {/* Battery cells */}
      {[-1, -0.35, 0.35, 1].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.4, 0]}>
            <boxGeometry args={[0.5, 0.65, 1]} />
            {i === 0
              ? <Mat matRef={matRef} color={color} emissive={emissive} />
              : <SecondaryMat color={color} emissive={emissive} />
            }
          </mesh>
          {/* Status LED */}
          <mesh position={[x, 0.8, 0.52]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
        </group>
      ))}
      {/* Cable conduits */}
      <mesh position={[0, 0.05, 0.8]}>
        <boxGeometry args={[3.2, 0.08, 0.08]} />
        <SecondaryMat color="#525252" emissive="#404040" />
      </mesh>
    </group>
  );
}

// ─── Microgrid: small cluster of mixed elements ──────────────────────

function MicrogridModel({ color, emissive, matRef }: ModelProps) {
  return (
    <group>
      {/* Central controller box */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.6, 0.7, 0.6]} />
        <Mat matRef={matRef} color={color} emissive={emissive} />
      </mesh>
      {/* Small solar panel */}
      <mesh position={[-1, 0.4, 0.5]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.8, 0.04, 0.5]} />
        <SecondaryMat color="#1e3a5f" emissive="#1d4ed8" />
      </mesh>
      {/* Small battery */}
      <mesh position={[1, 0.25, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.4]} />
        <SecondaryMat color="#10b981" emissive="#047857" />
      </mesh>
      {/* Small wind pole */}
      <mesh position={[0.5, 0.8, -0.8]}>
        <cylinderGeometry args={[0.03, 0.04, 1.6, 6]} />
        <SecondaryMat color="#e2e8f0" emissive="#94a3b8" />
      </mesh>
      {/* Ring boundary */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.6, 1.8, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Data Center: wide building + HVAC units + server rows ───────────

function DataCenterModel({ color, emissive, matRef }: ModelProps) {
  return (
    <group>
      {/* Main hall */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[3, 1.4, 2]} />
        <Mat matRef={matRef} color={color} emissive={emissive} />
      </mesh>
      {/* HVAC units on roof */}
      {[[-0.8, 0], [0, 0], [0.8, 0]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.55, z]}>
          <boxGeometry args={[0.5, 0.3, 0.5]} />
          <SecondaryMat color="#6b7280" emissive="#4b5563" />
        </mesh>
      ))}
      {/* Server room glow strips */}
      {[-0.6, 0, 0.6].map((z, i) => (
        <mesh key={i} position={[0, 0.2, z + 1.01]}>
          <boxGeometry args={[2.6, 0.05, 0.02]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Security fence posts */}
      {[[-1.8, 1.2], [1.8, 1.2], [-1.8, -1.2], [1.8, -1.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.5, z]}>
          <cylinderGeometry args={[0.03, 0.03, 1, 4]} />
          <SecondaryMat color="#71717a" emissive="#52525b" />
        </mesh>
      ))}
    </group>
  );
}

// ─── EV Charging Hub: charging posts + canopy + cars ─────────────────

function EVChargingModel({ color, emissive, matRef }: ModelProps) {
  return (
    <group>
      {/* Canopy */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[3, 0.06, 2]} />
        <SecondaryMat color="#374151" emissive="#1f2937" />
      </mesh>
      {/* Canopy supports */}
      {[[-1.2, -0.8], [1.2, -0.8], [-1.2, 0.8], [1.2, 0.8]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.8, z]}>
          <cylinderGeometry args={[0.04, 0.04, 1.6, 6]} />
          <SecondaryMat color="#525252" emissive="#404040" />
        </mesh>
      ))}
      {/* Charger posts */}
      {[-0.8, 0, 0.8].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.5, 0.6]}>
            <boxGeometry args={[0.2, 1, 0.15]} />
            {i === 0
              ? <Mat matRef={matRef} color={color} emissive={emissive} />
              : <SecondaryMat color={color} emissive={emissive} />
            }
          </mesh>
          {/* LED strip on charger */}
          <mesh position={[x, 0.85, 0.69]}>
            <boxGeometry args={[0.12, 0.15, 0.01]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
          {/* Parked car shape */}
          <mesh position={[x, 0.2, -0.2]}>
            <boxGeometry args={[0.5, 0.25, 0.9]} />
            <SecondaryMat color="#475569" emissive="#334155" />
          </mesh>
        </group>
      ))}
      {/* Solar panel on canopy */}
      <mesh position={[0, 1.65, 0]}>
        <boxGeometry args={[2.8, 0.03, 1.8]} />
        <SecondaryMat color="#1e3a5f" emissive="#1d4ed8" />
      </mesh>
    </group>
  );
}

// ─── Hospital: cross-shaped top + emergency glow ─────────────────────

function HospitalModel({ color, emissive, matRef }: ModelProps) {
  return (
    <group>
      {/* Main building */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1.8, 2, 1.5]} />
        <Mat matRef={matRef} color={color} emissive={emissive} />
      </mesh>
      {/* Cross - horizontal */}
      <mesh position={[0, 2.15, 0.76]}>
        <boxGeometry args={[0.6, 0.15, 0.02]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Cross - vertical */}
      <mesh position={[0, 2.15, 0.76]}>
        <boxGeometry args={[0.15, 0.6, 0.02]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Wing left */}
      <mesh position={[-1.4, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1.2]} />
        <SecondaryMat color="#991b1b" emissive="#7f1d1d" />
      </mesh>
      {/* Wing right */}
      <mesh position={[1.4, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1.2]} />
        <SecondaryMat color="#991b1b" emissive="#7f1d1d" />
      </mesh>
      {/* Helipad on roof */}
      <mesh position={[0, 2.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Emergency entrance glow */}
      <mesh position={[0, 0.15, 0.76]}>
        <boxGeometry args={[0.6, 0.3, 0.02]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// ─── Stadium: open-top ring with field ───────────────────────────────

function StadiumModel({ color, emissive, matRef }: ModelProps) {
  return (
    <group>
      {/* Outer ring wall */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[1.8, 2, 1.2, 24, 1, true]} />
        <Mat matRef={matRef} color={color} emissive={emissive} />
      </mesh>
      {/* Inner ring (seating) */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.2, 1.6, 1, 24, 1, true]} />
        <SecondaryMat color="#78716c" emissive="#57534e" />
      </mesh>
      {/* Field */}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 24]} />
        <meshStandardMaterial color="#15803d" emissive="#166534" emissiveIntensity={0.2} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* Floodlights */}
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <group key={deg}>
            <mesh position={[Math.cos(rad) * 2, 1.2, Math.sin(rad) * 2]}>
              <cylinderGeometry args={[0.03, 0.03, 2.4, 4]} />
              <SecondaryMat color="#e2e8f0" emissive="#94a3b8" />
            </mesh>
            <mesh position={[Math.cos(rad) * 1.85, 2.3, Math.sin(rad) * 1.85]}>
              <sphereGeometry args={[0.1, 6, 6]} />
              <meshBasicMaterial color="#fef9c3" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ─── Transmission Lines ──────────────────────────────────────────────

function TransmissionLine({ source, target }: { source: GridNode; target: GridNode }) {
  const isOffline = source.status === "offline" || target.status === "offline";
  const isWarning = source.status === "warning" || target.status === "warning";

  const points = useMemo(() => {
    const p1 = coordsToVector3({ latitude: source.lat, longitude: source.lng, altitude: 5 }, ORIGIN);
    const p2 = coordsToVector3({ latitude: target.lat, longitude: target.lng, altitude: 5 }, ORIGIN);
    return [new THREE.Vector3(...p1), new THREE.Vector3(...p2)];
  }, [source.lat, source.lng, target.lat, target.lng]);

  let lineColor = "#3b82f6";
  if (isOffline) lineColor = "#1f2937";
  else if (isWarning) lineColor = "#facc15";

  return (
    <Line
      points={points}
      color={lineColor}
      lineWidth={isOffline ? 1 : isWarning ? 3 : 2}
      opacity={isOffline ? 0.2 : 0.8}
      transparent
      dashed={isWarning}
      dashScale={10}
      dashSize={2}
      dashOffset={0}
    />
  );
}
