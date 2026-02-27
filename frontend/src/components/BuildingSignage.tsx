import { useRef } from "react";
import { Text3D, Center } from "@react-three/drei";

interface BuildingSignageProps {
  text: string;
  position: [number, number, number];
  color: string;
  visible: boolean;
}

export default function BuildingSignage({
  text,
  position,
  color,
  visible,
}: BuildingSignageProps) {
  if (!visible || !text.trim()) return null;

  return (
    <group position={position}>
      <Center>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={0.5}
          height={0.1}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          {text}
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
        </Text3D>
      </Center>
    </group>
  );
}
