"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore, GridNode } from '../store/useSimulationStore';

export default function CityMap() {
    const { nodes } = useSimulationStore();

    // Deduplicate transmission lines for rendering
    const lines = useMemo(() => {
        const pairs: [GridNode, GridNode][] = [];
        const seen = new Set<string>();

        Object.values(nodes).forEach(node => {
            node.connections.forEach(targetId => {
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
        <Canvas camera={{ position: [15, 10, 15], fov: 45 }}>
            <color attach="background" args={['#050510']} />
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 20, 10]} intensity={1} color="#aaccff" />

            {/* Cool Neon Grid */}
            <Grid
                position={[0, -0.01, 0]}
                args={[30, 30]}
                cellSize={1} cellThickness={0.5} cellColor="#1c2b4d"
                sectionSize={5} sectionThickness={1} sectionColor="#2d4073"
                fadeDistance={40} fadeStrength={1}
            />

            {/* Background Environment */}
            <Environment preset="night" />

            {/* Render Substations / Generators / Infrastructure */}
            {Object.values(nodes).map(node => (
                <CityNode key={node.id} node={node} />
            ))}

            {/* Render Transmission Lines */}
            {lines.map(([n1, n2], i) => (
                <TransmissionLine key={i} source={n1} target={n2} />
            ))}

            <OrbitControls
                maxPolarAngle={Math.PI / 2 - 0.05}
                minDistance={5}
                maxDistance={50}
                enableDamping
                autoRotate
                autoRotateSpeed={0.5}
            />
        </Canvas>
    );
}

function CityNode({ node }: { node: GridNode }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);

    useFrame((state) => {
        if (!meshRef.current || !materialRef.current) return;

        // Pulse logic based on load or status
        if (node.status === 'offline') {
            materialRef.current.emissiveIntensity = 0;
        } else if (node.status === 'warning' || node.status === 'critical') {
            const pulse = (Math.sin(state.clock.elapsedTime * 5) + 1) / 2;
            materialRef.current.emissiveIntensity = 0.5 + pulse * 1.5;
        } else {
            // Normal pulse
            const loadRatio = node.capacity > 0 ? node.currentLoad / node.capacity : 0;
            const pulse = (Math.sin(state.clock.elapsedTime * 2) + 1) * 0.5;
            // Higher load = faster/brighter pulse
            materialRef.current.emissiveIntensity = 0.2 + (loadRatio * pulse);
        }
    });

    let color = '#22d3ee'; // default cyan (normal load)
    let emissive = '#0891b2';

    if (node.status === 'warning') {
        color = '#facc15';
        emissive = '#ca8a04';
    } else if (node.status === 'critical' || (node.type === 'substation' && node.currentLoad > node.capacity * 0.9)) {
        color = '#ef4444';
        emissive = '#dc2626';
    } else if (node.status === 'offline') {
        color = '#1f2937';
        emissive = '#000000';
    }

    // Geometry based on type
    let geometry = <boxGeometry args={[1, 1, 1]} />;
    let scale = 1;

    switch (node.type) {
        case 'power_plant':
            geometry = <cylinderGeometry args={[1.5, 1.5, 3, 16]} />;
            emissive = node.status === 'offline' ? '#000' : '#f97316'; // Orange plant
            scale = 1.2;
            break;
        case 'substation':
            geometry = <boxGeometry args={[1.2, 0.8, 1.2]} />;
            break;
        case 'data_center':
            geometry = <boxGeometry args={[2, 2, 2]} />;
            color = '#a855f7';
            emissive = '#7e22ce';
            break;
        case 'solar_farm':
            geometry = <boxGeometry args={[3, 0.1, 3]} />;
            color = '#3b82f6';
            emissive = '#1d4ed8';
            break;
        case 'battery_storage':
            geometry = <boxGeometry args={[1, 1.5, 1]} />;
            color = '#10b981';
            emissive = '#047857';
            break;
    }

    return (
        <group position={node.position}>
            <mesh ref={meshRef} scale={scale} position={[0, scale * 0.5, 0]}>
                {geometry}
                <meshStandardMaterial
                    ref={materialRef}
                    color={color}
                    emissive={emissive}
                    emissiveIntensity={0.5}
                    toneMapped={false}
                />
            </mesh>

            {/* Status Indicator floating above */}
            {node.status !== 'normal' && (
                <mesh position={[0, scale * 2, 0]}>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshBasicMaterial color={node.status === 'offline' ? '#ef4444' : '#facc15'} />
                </mesh>
            )}
        </group>
    );
}

function TransmissionLine({ source, target }: { source: GridNode, target: GridNode }) {
    const isOffline = source.status === 'offline' || target.status === 'offline';
    const isWarning = source.status === 'warning' || target.status === 'warning';

    let color = '#22d3ee'; // Cyan
    if (isOffline) color = '#1f2937';
    else if (isWarning) color = '#facc15';

    // Simple line setup
    const points = [
        new THREE.Vector3(source.position[0], 0.2, source.position[2]),
        new THREE.Vector3(target.position[0], 0.2, target.position[2]),
    ];

    return (
        <Line
            points={points}
            color={color}
            lineWidth={isOffline ? 1 : (isWarning ? 3 : 2)}
            opacity={isOffline ? 0.2 : 0.8}
            transparent
            dashed={isWarning}
            dashScale={10}
            dashSize={2}
            dashOffset={0}
        />
    );
}
