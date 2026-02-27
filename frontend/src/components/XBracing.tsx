interface XBracingProps {
  length: number;
  width: number;
  height: number;
  baySpacing: number;
  numBays: number;
  bracedBays: number[];
  visible: boolean;
  color?: string;
}

export default function XBracing({
  length,
  width,
  height,
  baySpacing,
  numBays,
  bracedBays,
  visible,
  color = "#c0a060",
}: XBracingProps) {
  if (!visible || bracedBays.length === 0) return null;

  const rodRadius = 0.025;

  return (
    <group>
      {bracedBays.map((bayIndex) => {
        if (bayIndex >= numBays) return null;
        const z1 = -length / 2 + bayIndex * baySpacing;
        const z2 = z1 + baySpacing;
        const zMid = (z1 + z2) / 2;

        // Diagonal length for wall X-bracing
        const diagLen = Math.sqrt(Math.pow(baySpacing, 2) + Math.pow(height, 2));
        const angle = Math.atan2(height, baySpacing);

        return (
          <group key={`brace-${bayIndex}`}>
            {/* Left wall X-bracing */}
            <mesh
              position={[-width / 2, height / 2, zMid]}
              rotation={[angle, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[rodRadius, rodRadius, diagLen, 6]} />
              <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh
              position={[-width / 2, height / 2, zMid]}
              rotation={[-angle, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[rodRadius, rodRadius, diagLen, 6]} />
              <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Right wall X-bracing */}
            <mesh
              position={[width / 2, height / 2, zMid]}
              rotation={[angle, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[rodRadius, rodRadius, diagLen, 6]} />
              <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh
              position={[width / 2, height / 2, zMid]}
              rotation={[-angle, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[rodRadius, rodRadius, diagLen, 6]} />
              <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
