import { useRef, useState, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export type VehiclePreset = "Truck" | "Forklift";

const VEHICLE_DIMENSIONS: Record<VehiclePreset, [number, number, number]> = {
  Truck: [6, 3.5, 2.5],
  Forklift: [3, 2.2, 1.5],
};

interface ClearanceCheckBoxProps {
  preset: VehiclePreset;
  buildingBounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  structuralBounds: THREE.Box3[];
}

export default function ClearanceCheckBox({
  preset,
  buildingBounds,
  structuralBounds,
}: ClearanceCheckBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isColliding, setIsColliding] = useState(false);
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 2]);
  const { camera, gl } = useThree();
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycasterRef = useRef(new THREE.Raycaster());
  // Reuse a Vector2 to avoid allocations
  const ndcRef = useRef(new THREE.Vector2());

  const [w, h, d] = VEHICLE_DIMENSIONS[preset];

  const checkCollision = useCallback(
    (pos: [number, number, number]) => {
      const vehicleBox = new THREE.Box3(
        new THREE.Vector3(pos[0] - w / 2, pos[1], pos[2] - d / 2),
        new THREE.Vector3(pos[0] + w / 2, pos[1] + h, pos[2] + d / 2)
      );
      return structuralBounds.some((b) => vehicleBox.intersectsBox(b));
    },
    [w, h, d, structuralBounds]
  );

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    gl.domElement.style.cursor = "grabbing";
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    gl.domElement.style.cursor = "auto";
  };

  const handlePointerMove = useCallback(
    (e: any) => {
      if (!isDragging) return;
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Use THREE.Vector2 instance for setFromCamera
      ndcRef.current.set(x, y);
      raycasterRef.current.setFromCamera(ndcRef.current, camera);

      const target = new THREE.Vector3();
      raycasterRef.current.ray.intersectPlane(planeRef.current, target);

      if (target) {
        const newPos: [number, number, number] = [
          Math.max(buildingBounds.minX + w / 2, Math.min(buildingBounds.maxX - w / 2, target.x)),
          0,
          Math.max(buildingBounds.minZ + d / 2, Math.min(buildingBounds.maxZ - d / 2, target.z)),
        ];
        setPosition(newPos);
        setIsColliding(checkCollision(newPos));
      }
    },
    [isDragging, camera, gl, buildingBounds, w, d, checkCollision]
  );

  return (
    <mesh
      ref={meshRef}
      position={[position[0], h / 2, position[2]]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      castShadow
    >
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial
        color={isColliding ? "#ff3333" : "#33ff66"}
        transparent
        opacity={0.5}
        emissive={isColliding ? "#ff0000" : "#00ff44"}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}
