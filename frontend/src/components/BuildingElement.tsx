import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BuildingElement as BuildingElementData } from '../utils/dxfParser';

// Color map for element types (literal values for Three.js)
const ELEMENT_COLORS: Record<string, number> = {
  ANCHOR_BOLT: 0xf59e0b,
  ANCHOR: 0xf59e0b,
  COLUMN: 0x60a5fa,
  RAFTER: 0x34d399,
  STRUT: 0xa78bfa,
  PURLIN: 0xfb923c,
  GIRT: 0xf472b6,
  SHEETING: 0x94a3b8,
};

const ELEMENT_RADIUS: Record<string, number> = {
  ANCHOR_BOLT: 0.08,
  ANCHOR: 0.08,
  COLUMN: 0.15,
  RAFTER: 0.12,
  STRUT: 0.08,
  PURLIN: 0.06,
  GIRT: 0.06,
  SHEETING: 0.04,
};

interface BuildingElementProps {
  element: BuildingElementData;
  visible: boolean;
  animateIn: boolean;
}

export default function BuildingElementMesh({ element, visible, animateIn }: BuildingElementProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const animProgress = useRef(0);
  const isAnimating = useRef(false);
  const targetY = useRef(0);
  const startY = useRef(0);

  const { start, end, layer } = element;

  // Calculate geometry
  const startVec = new THREE.Vector3(start.x, start.y, start.z);
  const endVec = new THREE.Vector3(end.x, end.y, end.z);
  const direction = new THREE.Vector3().subVectors(endVec, startVec);
  const length = direction.length();
  const midpoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);

  const color = ELEMENT_COLORS[layer] ?? 0x888888;
  const radius = ELEMENT_RADIUS[layer] ?? 0.08;

  // Quaternion to orient cylinder along direction
  const quaternion = new THREE.Quaternion();
  if (length > 0.001) {
    const normalized = direction.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0);
    quaternion.setFromUnitVectors(up, normalized);
  }

  useEffect(() => {
    if (!meshRef.current) return;

    if (animateIn && visible) {
      // Start fly-in animation from above
      const dropHeight = 8;
      startY.current = midpoint.y + dropHeight;
      targetY.current = midpoint.y;
      animProgress.current = 0;
      isAnimating.current = true;
      meshRef.current.position.set(midpoint.x, startY.current, midpoint.z);
      meshRef.current.scale.setScalar(0.1);
    } else if (visible) {
      meshRef.current.position.set(midpoint.x, midpoint.y, midpoint.z);
      meshRef.current.scale.setScalar(1);
      isAnimating.current = false;
    }
  }, [visible, animateIn]);

  useFrame((_state, delta) => {
    if (!meshRef.current || !isAnimating.current) return;

    animProgress.current = Math.min(animProgress.current + delta * 2.5, 1);
    const t = easeOutBounce(animProgress.current);

    const currentY = startY.current + (targetY.current - startY.current) * t;
    meshRef.current.position.set(midpoint.x, currentY, midpoint.z);
    meshRef.current.scale.setScalar(0.1 + 0.9 * t);

    if (animProgress.current >= 1) {
      isAnimating.current = false;
      meshRef.current.position.set(midpoint.x, midpoint.y, midpoint.z);
      meshRef.current.scale.setScalar(1);
    }
  });

  if (!visible || length < 0.001) return null;

  return (
    <mesh
      ref={meshRef}
      position={[midpoint.x, midpoint.y, midpoint.z]}
      quaternion={quaternion}
    >
      <cylinderGeometry args={[radius, radius, length, 6]} />
      <meshStandardMaterial
        color={color}
        roughness={0.4}
        metalness={0.6}
        emissive={color}
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}

function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}
