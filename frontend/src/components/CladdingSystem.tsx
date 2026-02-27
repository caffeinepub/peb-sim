import { useRef } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export type CladdingProfile = "Trapezoidal" | "Standing Seam";

interface CladdingSystemProps {
  length: number;
  width: number;
  height: number;
  ridgeHeight: number;
  showRoof: boolean;
  showWalls: boolean;
  profile: CladdingProfile;
  skylightMode: boolean;
  roofColor: string;
  wallColor: string;
}

export default function CladdingSystem({
  length,
  width,
  height,
  ridgeHeight,
  showRoof,
  showWalls,
  profile,
  skylightMode,
  roofColor,
  wallColor,
}: CladdingSystemProps) {
  const trapTexture = useTexture("/assets/generated/cladding-trapezoidal.dim_512x512.png");
  const seamTexture = useTexture("/assets/generated/cladding-standing-seam.dim_512x512.png");

  const texture = profile === "Trapezoidal" ? trapTexture : seamTexture;

  // Configure texture repeat
  const roofTexture = texture.clone();
  roofTexture.wrapS = THREE.RepeatWrapping;
  roofTexture.wrapT = THREE.RepeatWrapping;
  roofTexture.repeat.set(length / 2, 4);
  roofTexture.needsUpdate = true;

  const wallTexture = texture.clone();
  wallTexture.wrapS = THREE.RepeatWrapping;
  wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set(length / 3, 2);
  wallTexture.needsUpdate = true;

  const roofPitch = Math.atan2(ridgeHeight - height, width / 2);
  const roofSlopeLength = Math.sqrt(
    Math.pow(width / 2, 2) + Math.pow(ridgeHeight - height, 2)
  );

  const roofMaterialProps = skylightMode
    ? {
        color: "#a8d8ea",
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      }
    : {
        map: roofTexture,
        color: roofColor,
        transparent: false,
        opacity: 1,
        side: THREE.DoubleSide,
      };

  const wallMaterialProps = skylightMode
    ? {
        color: "#a8d8ea",
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      }
    : {
        map: wallTexture,
        color: wallColor,
        transparent: false,
        opacity: 1,
        side: THREE.DoubleSide,
      };

  return (
    <group>
      {/* Roof Cladding */}
      {showRoof && (
        <group>
          {/* Left roof slope */}
          <mesh
            position={[-width / 4, height + (ridgeHeight - height) / 2, 0]}
            rotation={[0, 0, roofPitch]}
            receiveShadow
            castShadow
          >
            <planeGeometry args={[roofSlopeLength, length]} />
            <meshStandardMaterial {...roofMaterialProps} />
          </mesh>
          {/* Right roof slope */}
          <mesh
            position={[width / 4, height + (ridgeHeight - height) / 2, 0]}
            rotation={[0, 0, -roofPitch]}
            receiveShadow
            castShadow
          >
            <planeGeometry args={[roofSlopeLength, length]} />
            <meshStandardMaterial {...roofMaterialProps} />
          </mesh>
        </group>
      )}

      {/* Wall Cladding */}
      {showWalls && (
        <group>
          {/* Front wall */}
          <mesh
            position={[0, height / 2, -length / 2]}
            receiveShadow
            castShadow
          >
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial {...wallMaterialProps} />
          </mesh>
          {/* Back wall */}
          <mesh
            position={[0, height / 2, length / 2]}
            rotation={[0, Math.PI, 0]}
            receiveShadow
            castShadow
          >
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial {...wallMaterialProps} />
          </mesh>
          {/* Left wall */}
          <mesh
            position={[-width / 2, height / 2, 0]}
            rotation={[0, Math.PI / 2, 0]}
            receiveShadow
            castShadow
          >
            <planeGeometry args={[length, height]} />
            <meshStandardMaterial {...wallMaterialProps} />
          </mesh>
          {/* Right wall */}
          <mesh
            position={[width / 2, height / 2, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            receiveShadow
            castShadow
          >
            <planeGeometry args={[length, height]} />
            <meshStandardMaterial {...wallMaterialProps} />
          </mesh>
        </group>
      )}
    </group>
  );
}
