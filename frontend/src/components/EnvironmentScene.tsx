import { useTexture, Sky } from "@react-three/drei";
import * as THREE from "three";

export type GroundTexture = "Concrete" | "Asphalt" | "Grass";

interface EnvironmentSceneProps {
  groundTexture: GroundTexture;
  timeOfDay: number;
}

export default function EnvironmentScene({ groundTexture, timeOfDay }: EnvironmentSceneProps) {
  const concreteTexture = useTexture("/assets/generated/ground-concrete.dim_512x512.png");
  const asphaltTexture = useTexture("/assets/generated/ground-asphalt.dim_512x512.png");
  const grassTexture = useTexture("/assets/generated/ground-grass.dim_512x512.png");

  const textureMap: Record<GroundTexture, THREE.Texture> = {
    Concrete: concreteTexture,
    Asphalt: asphaltTexture,
    Grass: grassTexture,
  };

  const selectedTexture = textureMap[groundTexture];
  selectedTexture.wrapS = THREE.RepeatWrapping;
  selectedTexture.wrapT = THREE.RepeatWrapping;
  selectedTexture.repeat.set(20, 20);

  // Sun position based on time of day (6=sunrise, 12=noon, 20=sunset)
  const t = (timeOfDay - 6) / 14; // 0 to 1
  const elevation = Math.sin(t * Math.PI) * 80; // degrees
  const azimuth = t * 180 - 90; // degrees

  const elevRad = (elevation * Math.PI) / 180;
  const azimRad = (azimuth * Math.PI) / 180;
  const sunX = Math.cos(elevRad) * Math.sin(azimRad);
  const sunY = Math.sin(elevRad);
  const sunZ = Math.cos(elevRad) * Math.cos(azimRad);

  return (
    <group>
      {/* Sky */}
      <Sky
        sunPosition={[sunX * 100, sunY * 100, sunZ * 100]}
        turbidity={8}
        rayleigh={2}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial map={selectedTexture} />
      </mesh>
    </group>
  );
}
