import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";

interface WalkthroughControllerProps {
  buildingBounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    maxY: number;
  };
  onExit: () => void;
}

export default function WalkthroughController({
  buildingBounds,
  onExit,
}: WalkthroughControllerProps) {
  const { camera } = useThree();
  const keysRef = useRef<Record<string, boolean>>({});
  const moveSpeed = 5; // m/s
  const eyeHeight = 1.7;

  useEffect(() => {
    // Position camera inside building at ground level
    camera.position.set(0, eyeHeight, 0);
    camera.lookAt(0, eyeHeight, -5);

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === "Escape") {
        onExit();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [camera, onExit]);

  useFrame((_, delta) => {
    const keys = keysRef.current;
    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    if (keys["KeyW"] || keys["ArrowUp"]) direction.add(forward);
    if (keys["KeyS"] || keys["ArrowDown"]) direction.sub(forward);
    if (keys["KeyA"] || keys["ArrowLeft"]) direction.sub(right);
    if (keys["KeyD"] || keys["ArrowRight"]) direction.add(right);

    if (direction.lengthSq() > 0) {
      direction.normalize().multiplyScalar(moveSpeed * delta);
      const newPos = camera.position.clone().add(direction);

      // Collision detection: clamp to building bounds with margin
      const margin = 0.5;
      newPos.x = Math.max(buildingBounds.minX + margin, Math.min(buildingBounds.maxX - margin, newPos.x));
      newPos.z = Math.max(buildingBounds.minZ + margin, Math.min(buildingBounds.maxZ - margin, newPos.z));
      newPos.y = eyeHeight; // Keep at eye height

      camera.position.copy(newPos);
    }
  });

  return <PointerLockControls />;
}
