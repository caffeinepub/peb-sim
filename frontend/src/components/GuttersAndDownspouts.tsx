import * as THREE from "three";

interface GuttersAndDownspotsProps {
  length: number;
  width: number;
  height: number;
  visible: boolean;
  color?: string;
}

export default function GuttersAndDownspouts({
  length,
  width,
  height,
  visible,
  color = "#4a5568",
}: GuttersAndDownspotsProps) {
  if (!visible) return null;

  const gutterY = height - 0.05;
  const downspoutSpacing = 6;
  const numDownspouts = Math.max(2, Math.ceil(length / downspoutSpacing));

  return (
    <group>
      {/* Front eave gutter */}
      <mesh position={[0, gutterY, -length / 2 - 0.05]} castShadow>
        <boxGeometry args={[width + 0.2, 0.12, 0.12]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Back eave gutter */}
      <mesh position={[0, gutterY, length / 2 + 0.05]} castShadow>
        <boxGeometry args={[width + 0.2, 0.12, 0.12]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Left side gutter */}
      <mesh position={[-width / 2 - 0.05, gutterY, 0]} castShadow>
        <boxGeometry args={[0.12, 0.12, length + 0.2]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Right side gutter */}
      <mesh position={[width / 2 + 0.05, gutterY, 0]} castShadow>
        <boxGeometry args={[0.12, 0.12, length + 0.2]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Downspouts along left side */}
      {Array.from({ length: numDownspouts }).map((_, i) => {
        const z = -length / 2 + (i + 0.5) * (length / numDownspouts);
        return (
          <mesh key={`ds-left-${i}`} position={[-width / 2 - 0.05, height / 2, z]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, height, 8]} />
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
          </mesh>
        );
      })}

      {/* Downspouts along right side */}
      {Array.from({ length: numDownspouts }).map((_, i) => {
        const z = -length / 2 + (i + 0.5) * (length / numDownspouts);
        return (
          <mesh key={`ds-right-${i}`} position={[width / 2 + 0.05, height / 2, z]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, height, 8]} />
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}
