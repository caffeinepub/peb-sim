interface DoorPlacement {
  id: string;
  type: "door" | "shutter";
  wallSide: "front" | "back" | "left" | "right";
  position: number; // normalized 0-1 along wall
}

interface DoorsAndShuttersProps {
  placements: DoorPlacement[];
  buildingLength: number;
  buildingWidth: number;
  buildingHeight: number;
  visible: boolean;
}

export default function DoorsAndShutters({
  placements,
  buildingLength,
  buildingWidth,
  buildingHeight,
  visible,
}: DoorsAndShuttersProps) {
  if (!visible) return null;

  return (
    <group>
      {placements.map((placement) => {
        const isDoor = placement.type === "door";
        const w = isDoor ? 1.2 : 4.0;
        const h = isDoor ? 2.1 : 4.0;
        const color = isDoor ? "#5a6a7a" : "#3a4a5a";

        let px = 0, py = h / 2, pz = 0;
        let ry = 0;

        switch (placement.wallSide) {
          case "front":
            pz = -buildingLength / 2;
            px = (placement.position - 0.5) * buildingWidth;
            ry = 0;
            break;
          case "back":
            pz = buildingLength / 2;
            px = (placement.position - 0.5) * buildingWidth;
            ry = Math.PI;
            break;
          case "left":
            px = -buildingWidth / 2;
            pz = (placement.position - 0.5) * buildingLength;
            ry = Math.PI / 2;
            break;
          case "right":
            px = buildingWidth / 2;
            pz = (placement.position - 0.5) * buildingLength;
            ry = -Math.PI / 2;
            break;
        }

        return (
          <group key={placement.id} position={[px, py, pz]} rotation={[0, ry, 0]}>
            {/* Door/shutter panel */}
            <mesh castShadow>
              <boxGeometry args={[w, h, 0.05]} />
              <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Frame */}
            <mesh>
              <boxGeometry args={[w + 0.1, h + 0.1, 0.03]} />
              <meshStandardMaterial color="#2a3a4a" metalness={0.6} roughness={0.4} />
            </mesh>
            {isDoor && (
              <mesh position={[w / 4, 0, 0.04]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#c0a060" metalness={0.9} roughness={0.1} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
