import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

interface ShadowStudyProps {
  timeOfDay: number; // 6 to 20
  enabled: boolean;
}

export default function ShadowStudy({ timeOfDay, enabled }: ShadowStudyProps) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const { gl } = useThree();

  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl]);

  // Calculate sun position
  const t = (timeOfDay - 6) / 14;
  const elevation = Math.sin(t * Math.PI) * 80;
  const azimuth = t * 180 - 90;
  const elevRad = (elevation * Math.PI) / 180;
  const azimRad = (azimuth * Math.PI) / 180;

  const sunX = Math.cos(elevRad) * Math.sin(azimRad) * 50;
  const sunY = Math.max(1, Math.sin(elevRad) * 50);
  const sunZ = Math.cos(elevRad) * Math.cos(azimRad) * 50;

  if (!enabled) {
    return (
      <group>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={0.8} />
      </group>
    );
  }

  return (
    <group>
      <ambientLight intensity={0.3} />
      <directionalLight
        ref={lightRef}
        position={[sunX, sunY, sunZ]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
    </group>
  );
}
