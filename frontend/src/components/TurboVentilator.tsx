import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TurboVentilatorProps {
  position: [number, number, number];
}

export default function TurboVentilator({ position }: TurboVentilatorProps) {
  const spinnerRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (spinnerRef.current) {
      spinnerRef.current.rotation.y += delta * 3;
    }
  });

  return (
    <group position={position}>
      {/* Base cylinder */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.2, 12]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Spinning vanes */}
      <group ref={spinnerRef} position={[0, 0.35, 0]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 8) * Math.PI * 2) * 0.18,
              0,
              Math.sin((i / 8) * Math.PI * 2) * 0.18,
            ]}
            rotation={[0, (i / 8) * Math.PI * 2, Math.PI / 6]}
            castShadow
          >
            <boxGeometry args={[0.06, 0.25, 0.02]} />
            <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        {/* Top dome */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <sphereGeometry args={[0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#999" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}
