import { useRef, useMemo } from "react";
import * as THREE from "three";

interface SecondaryMembersProps {
  length: number;
  width: number;
  height: number;
  ridgeHeight: number;
  baySpacing: number;
  numBays: number;
  visible: boolean;
  color?: string;
}

export default function SecondaryMembers({
  length,
  width,
  height,
  ridgeHeight,
  baySpacing,
  numBays,
  visible,
  color = "#8a9ba8",
}: SecondaryMembersProps) {
  const purlinRef = useRef<THREE.InstancedMesh>(null);
  const girtRef = useRef<THREE.InstancedMesh>(null);

  const purlinSpacing = 1.5;
  const girtSpacing = 1.5;

  const roofSlopeLength = Math.sqrt(
    Math.pow(width / 2, 2) + Math.pow(ridgeHeight - height, 2)
  );
  const roofPitch = Math.atan2(ridgeHeight - height, width / 2);

  // Compute purlin positions
  const purlinData = useMemo(() => {
    const positions: { x: number; y: number; z: number; side: "left" | "right" }[] = [];
    const numPurlins = Math.floor(roofSlopeLength / purlinSpacing);

    for (let b = 0; b < numBays; b++) {
      const zCenter = -length / 2 + baySpacing * b + baySpacing / 2;
      for (let p = 1; p <= numPurlins; p++) {
        const t = p / (numPurlins + 1);
        const slopeX = t * (width / 2);
        const slopeY = height + t * (ridgeHeight - height);

        // Left slope
        positions.push({ x: -slopeX, y: slopeY, z: zCenter, side: "left" });
        // Right slope
        positions.push({ x: slopeX, y: slopeY, z: zCenter, side: "right" });
      }
    }
    return positions;
  }, [length, width, height, ridgeHeight, baySpacing, numBays, roofSlopeLength]);

  // Compute girt positions
  const girtData = useMemo(() => {
    const positions: { x: number; y: number; z: number; axis: "x" | "z" }[] = [];
    const numGirts = Math.floor(height / girtSpacing);

    for (let g = 1; g <= numGirts; g++) {
      const y = g * girtSpacing;

      // Front and back walls (along X axis)
      for (let b = 0; b < numBays; b++) {
        const zCenter = -length / 2 + baySpacing * b + baySpacing / 2;
        positions.push({ x: 0, y, z: zCenter, axis: "z" });
      }

      // Side walls (along Z axis)
      for (let c = 0; c <= numBays; c++) {
        const z = -length / 2 + baySpacing * c;
        positions.push({ x: -width / 2 + width / 4, y, z, axis: "x" });
        positions.push({ x: width / 2 - width / 4, y, z, axis: "x" });
      }
    }
    return positions;
  }, [length, width, height, baySpacing, numBays]);

  // Set purlin instance matrices
  useMemo(() => {
    if (!purlinRef.current) return;
    const dummy = new THREE.Object3D();
    purlinData.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(0, 0, p.side === "left" ? roofPitch : -roofPitch);
      dummy.updateMatrix();
      purlinRef.current!.setMatrixAt(i, dummy.matrix);
    });
    purlinRef.current.instanceMatrix.needsUpdate = true;
  }, [purlinData, roofPitch]);

  // Set girt instance matrices
  useMemo(() => {
    if (!girtRef.current) return;
    const dummy = new THREE.Object3D();
    girtData.forEach((g, i) => {
      dummy.position.set(g.x, g.y, g.z);
      dummy.rotation.set(0, g.axis === "x" ? Math.PI / 2 : 0, 0);
      dummy.updateMatrix();
      girtRef.current!.setMatrixAt(i, dummy.matrix);
    });
    girtRef.current.instanceMatrix.needsUpdate = true;
  }, [girtData]);

  if (!visible) return null;

  return (
    <group>
      {/* Z-Purlins */}
      <instancedMesh
        ref={purlinRef}
        args={[undefined, undefined, purlinData.length]}
        castShadow
      >
        <boxGeometry args={[baySpacing * 0.95, 0.04, 0.08]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </instancedMesh>

      {/* C-Girts */}
      <instancedMesh
        ref={girtRef}
        args={[undefined, undefined, girtData.length]}
        castShadow
      >
        <boxGeometry args={[baySpacing * 0.95, 0.04, 0.08]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </instancedMesh>
    </group>
  );
}
