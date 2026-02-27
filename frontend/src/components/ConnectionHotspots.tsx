import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type ConnectionType = 'haunch_left' | 'haunch_right' | 'ridge' | 'base_plate_left' | 'base_plate_right';

export interface HotspotData {
  type: ConnectionType;
  position: [number, number, number];
  label: string;
}

interface HotspotSphereProps {
  hotspot: HotspotData;
  onClick: (hotspot: HotspotData) => void;
}

function HotspotSphere({ hotspot, onClick }: HotspotSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      meshRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.15);
    }
  });

  return (
    <group position={hotspot.position}>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.15} />
      </mesh>
      {/* Main sphere */}
      <mesh
        ref={meshRef}
        onClick={e => {
          e.stopPropagation();
          onClick(hotspot);
        }}
        onPointerOver={e => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={e => {
          e.stopPropagation();
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.8}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

interface ConnectionHotspotsProps {
  span: number;
  height: number;
  roofPitch: number;
  onHotspotClick: (hotspot: HotspotData) => void;
}

export default function ConnectionHotspots({ span, height, roofPitch, onHotspotClick }: ConnectionHotspotsProps) {
  const halfSpan = span / 2;
  const ridgeH = height + halfSpan * Math.tan((roofPitch * Math.PI) / 180);

  const hotspots: HotspotData[] = [
    {
      type: 'base_plate_left',
      position: [-halfSpan, 0.1, 0],
      label: 'Base Plate (Left)',
    },
    {
      type: 'base_plate_right',
      position: [halfSpan, 0.1, 0],
      label: 'Base Plate (Right)',
    },
    {
      type: 'haunch_left',
      position: [-halfSpan, height, 0],
      label: 'Haunch (Left)',
    },
    {
      type: 'haunch_right',
      position: [halfSpan, height, 0],
      label: 'Haunch (Right)',
    },
    {
      type: 'ridge',
      position: [0, ridgeH, 0],
      label: 'Ridge Connection',
    },
  ];

  return (
    <group>
      {hotspots.map(hotspot => (
        <HotspotSphere key={hotspot.type} hotspot={hotspot} onClick={onHotspotClick} />
      ))}
    </group>
  );
}
