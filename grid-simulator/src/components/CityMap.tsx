"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import Map from "react-map-gl/mapbox";
import { Canvas, coordsToVector3 } from "react-three-map";
import "mapbox-gl/dist/mapbox-gl.css";
import { useSimulationStore, GridNode, MAP_CENTER } from "../store/useSimulationStore";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const ORIGIN = { latitude: MAP_CENTER.lat, longitude: MAP_CENTER.lng };

export default function CityMap() {
  const { nodes } = useSimulationStore();

  const lines = useMemo(() => {
    const pairs: [GridNode, GridNode][] = [];
    const seen = new Set<string>();

    Object.values(nodes).forEach((node) => {
      node.connections.forEach((targetId) => {
        const target = nodes[targetId];
        if (target) {
          const id1 = node.id < target.id ? node.id : target.id;
          const id2 = node.id < target.id ? target.id : node.id;
          const key = `${id1}-${id2}`;
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
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: MAP_CENTER.lng,
        latitude: MAP_CENTER.lat,
        zoom: 16,
        pitch: 60,
        bearing: 0,
      }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      terrain={{ source: "mapbox", exaggeration: 1 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Canvas
        latitude={MAP_CENTER.lat}
        longitude={MAP_CENTER.lng}
        altitude={0}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1} color="#aaccff" />

        {Object.values(nodes).map((node) => (
          <CityNode key={node.id} node={node} />
        ))}

        {lines.map(([n1, n2], i) => (
          <TransmissionLine key={i} source={n1} target={n2} />
        ))}
      </Canvas>
    </Map>
  );
}

// Scale factor to make grid nodes visible on the map (meters → display size)
const NODE_SCALE = 40;

function CityNode({ node }: { node: GridNode }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const pos = useMemo(
    () =>
      coordsToVector3(
        { latitude: node.lat, longitude: node.lng },
        ORIGIN
      ) as [number, number, number],
    [node.lat, node.lng]
  );

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    if (node.status === "offline") {
      materialRef.current.emissiveIntensity = 0;
    } else if (node.status === "warning" || node.status === "critical") {
      const pulse = (Math.sin(state.clock.elapsedTime * 5) + 1) / 2;
      materialRef.current.emissiveIntensity = 0.5 + pulse * 1.5;
    } else {
      const loadRatio = node.capacity > 0 ? node.currentLoad / node.capacity : 0;
      const pulse = (Math.sin(state.clock.elapsedTime * 2) + 1) * 0.5;
      materialRef.current.emissiveIntensity = 0.2 + loadRatio * pulse;
    }
  });

  let color = "#22d3ee";
  let emissive = "#0891b2";

  if (node.status === "warning") {
    color = "#facc15";
    emissive = "#ca8a04";
  } else if (
    node.status === "critical" ||
    (node.type === "substation" && node.currentLoad / node.capacity > 0.9)
  ) {
    color = "#ef4444";
    emissive = "#dc2626";
  } else if (node.status === "offline") {
    color = "#1f2937";
    emissive = "#000000";
  }

  let geometry = <boxGeometry args={[1, 1, 1]} />;
  let scale = 1;

  switch (node.type) {
    case "power_plant":
      geometry = <cylinderGeometry args={[1.5, 1.5, 3, 16]} />;
      emissive = node.status === "offline" ? "#000" : "#f97316";
      scale = 1.2;
      break;
    case "substation":
      geometry = <boxGeometry args={[1.2, 0.8, 1.2]} />;
      break;
    case "data_center":
      geometry = <boxGeometry args={[2, 2, 2]} />;
      color = "#a855f7";
      emissive = "#7e22ce";
      break;
    case "solar_farm":
      geometry = <boxGeometry args={[3, 0.1, 3]} />;
      color = "#3b82f6";
      emissive = "#1d4ed8";
      break;
    case "battery_storage":
      geometry = <boxGeometry args={[1, 1.5, 1]} />;
      color = "#10b981";
      emissive = "#047857";
      break;
    default:
      break;
  }

  return (
    <group position={pos}>
      <mesh
        ref={meshRef}
        scale={[scale * NODE_SCALE, scale * NODE_SCALE, scale * NODE_SCALE]}
        position={[0, (scale * NODE_SCALE) * 0.5, 0]}
      >
        {geometry}
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={emissive}
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>

      {node.status !== "normal" && (
        <mesh position={[0, scale * NODE_SCALE * 2, 0]}>
          <sphereGeometry args={[0.3 * NODE_SCALE, 16, 16]} />
          <meshBasicMaterial
            color={node.status === "offline" ? "#ef4444" : "#facc15"}
          />
        </mesh>
      )}
    </group>
  );
}

function TransmissionLine({
  source,
  target,
}: {
  source: GridNode;
  target: GridNode;
}) {
  const isOffline = source.status === "offline" || target.status === "offline";
  const isWarning = source.status === "warning" || target.status === "warning";

  const points = useMemo(() => {
    const p1 = coordsToVector3(
      { latitude: source.lat, longitude: source.lng, altitude: 5 },
      ORIGIN
    );
    const p2 = coordsToVector3(
      { latitude: target.lat, longitude: target.lng, altitude: 5 },
      ORIGIN
    );
    return [new THREE.Vector3(...p1), new THREE.Vector3(...p2)];
  }, [source.lat, source.lng, target.lat, target.lng]);

  let color = "#3b82f6";
  if (isOffline) color = "#1f2937";
  else if (isWarning) color = "#facc15";

  return (
    <Line
      points={points}
      color={color}
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
