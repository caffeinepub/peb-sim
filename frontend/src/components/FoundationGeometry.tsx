import React from 'react';

interface FoundationGeometryProps {
  span: number;
  length: number;
  baySpacing: number;
}

export default function FoundationGeometry({ span, length, baySpacing }: FoundationGeometryProps) {
  const numBays = Math.max(1, Math.round(length / baySpacing));
  const halfSpan = span / 2;

  const positions: [number, number, number][] = [];
  for (let i = 0; i <= numBays; i++) {
    const z = i * baySpacing - length / 2;
    positions.push([-halfSpan, 0, z]);
    positions.push([halfSpan, 0, z]);
  }

  return (
    <group>
      {positions.map((pos, idx) => (
        <group key={idx} position={pos}>
          {/* Concrete Pedestal */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color="#9ca3af" roughness={0.9} metalness={0.0} />
          </mesh>
          {/* Foundation Block */}
          <mesh position={[0, -1.3, 0]}>
            <boxGeometry args={[1.6, 1.0, 1.6]} />
            <meshStandardMaterial color="#6b7280" roughness={1.0} metalness={0.0} transparent opacity={0.85} />
          </mesh>
          {/* Grout layer */}
          <mesh position={[0, -0.02, 0]}>
            <boxGeometry args={[0.82, 0.04, 0.82]} />
            <meshStandardMaterial color="#d1d5db" roughness={1.0} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
