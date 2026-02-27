import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import * as THREE from "three";
import CladdingSystem from "./CladdingSystem";
import SecondaryMembers from "./SecondaryMembers";
import TurboVentilator from "./TurboVentilator";
import GuttersAndDownspouts from "./GuttersAndDownspouts";
import DoorsAndShutters from "./DoorsAndShutters";
import XBracing from "./XBracing";
import EnvironmentScene from "./EnvironmentScene";
import ShadowStudy from "./ShadowStudy";
import BuildingSignage from "./BuildingSignage";
import WalkthroughController from "./WalkthroughController";
import ClearanceCheckBox from "./ClearanceCheckBox";
import type { CladdingState } from "./CladdingControls";
import type { AccessoryState } from "./AccessoryControls";
import type { BrandingState } from "./BrandingControls";
import type { GroundTexture } from "./EnvironmentScene";
import type { VehiclePreset } from "./ClearanceCheckBox";

export interface BuildingParams {
  length: number;
  width: number;
  height: number;
  ridgeHeight: number;
  baySpacing: number;
  numBays: number;
  erectionStep: number;
  totalSteps: number;
}

export interface BuildingSimulatorHandle {
  playFullSequence: (onComplete: () => void) => void;
  getCanvas: () => HTMLCanvasElement | null;
}

interface BuildingSimulatorProps {
  params: BuildingParams;
  claddingState: CladdingState;
  accessoryState: AccessoryState;
  brandingState: BrandingState;
  groundTexture: GroundTexture;
  timeOfDay: number;
  shadowStudyEnabled: boolean;
  isWalkthrough: boolean;
  clearanceEnabled: boolean;
  clearancePreset: VehiclePreset;
  onWalkthroughExit: () => void;
  onErectionStepChange?: (step: number) => void;
}

// Inner scene component
function BuildingScene({
  params,
  claddingState,
  accessoryState,
  brandingState,
  groundTexture,
  timeOfDay,
  shadowStudyEnabled,
  isWalkthrough,
  clearanceEnabled,
  clearancePreset,
  onWalkthroughExit,
}: Omit<BuildingSimulatorProps, "onErectionStepChange">) {
  const { length, width, height, ridgeHeight, baySpacing, numBays, erectionStep, totalSteps } = params;

  const columnColor = brandingState.structureColor.hex;
  const rafterColor = brandingState.structureColor.hex;

  // Compute how many bays/columns to show based on erection step
  const progress = totalSteps > 0 ? erectionStep / totalSteps : 1;
  const visibleBays = Math.ceil(progress * numBays);

  // Structural member dimensions
  const colW = 0.25, colD = 0.3;
  const rafterW = 0.2, rafterD = 0.25;

  const buildingBounds = {
    minX: -width / 2,
    maxX: width / 2,
    minZ: -length / 2,
    maxZ: length / 2,
    maxY: ridgeHeight,
  };

  // Structural bounding boxes for clearance check
  const structuralBounds: THREE.Box3[] = [];
  for (let b = 0; b <= numBays; b++) {
    const z = -length / 2 + b * baySpacing;
    // Left column
    structuralBounds.push(
      new THREE.Box3(
        new THREE.Vector3(-width / 2 - colW / 2, 0, z - colD / 2),
        new THREE.Vector3(-width / 2 + colW / 2, height, z + colD / 2)
      )
    );
    // Right column
    structuralBounds.push(
      new THREE.Box3(
        new THREE.Vector3(width / 2 - colW / 2, 0, z - colD / 2),
        new THREE.Vector3(width / 2 + colW / 2, height, z + colD / 2)
      )
    );
  }

  // Ventilator positions along ridge
  const ventilatorPositions: [number, number, number][] = [];
  if (accessoryState.showVentilators) {
    const ventSpacing = Math.max(baySpacing * 2, 6);
    const numVents = Math.max(1, Math.floor(length / ventSpacing));
    for (let i = 0; i < numVents; i++) {
      const z = -length / 2 + (i + 0.5) * (length / numVents);
      ventilatorPositions.push([0, ridgeHeight + 0.2, z]);
    }
  }

  // Default door placements
  const doorPlacements = accessoryState.showDoors
    ? [
        { id: "door-1", type: "door" as const, wallSide: "front" as const, position: 0.3 },
        { id: "shutter-1", type: "shutter" as const, wallSide: "front" as const, position: 0.7 },
      ]
    : [];

  return (
    <>
      {/* Lighting */}
      <ShadowStudy timeOfDay={timeOfDay} enabled={shadowStudyEnabled} />

      {/* Environment */}
      <Suspense fallback={null}>
        <EnvironmentScene groundTexture={groundTexture} timeOfDay={timeOfDay} />
      </Suspense>

      {/* Structural Frame */}
      <group>
        {Array.from({ length: Math.min(visibleBays + 1, numBays + 1) }).map((_, frameIdx) => {
          const z = -length / 2 + frameIdx * baySpacing;
          return (
            <group key={`frame-${frameIdx}`}>
              {/* Left column */}
              <mesh position={[-width / 2, height / 2, z]} castShadow receiveShadow>
                <boxGeometry args={[colW, height, colD]} />
                <meshStandardMaterial color={columnColor} metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Right column */}
              <mesh position={[width / 2, height / 2, z]} castShadow receiveShadow>
                <boxGeometry args={[colW, height, colD]} />
                <meshStandardMaterial color={columnColor} metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Left rafter */}
              <mesh
                position={[-width / 4, height + (ridgeHeight - height) / 2, z]}
                rotation={[0, 0, Math.atan2(ridgeHeight - height, width / 2)]}
                castShadow
                receiveShadow
              >
                <boxGeometry
                  args={[
                    Math.sqrt(Math.pow(width / 2, 2) + Math.pow(ridgeHeight - height, 2)),
                    rafterD,
                    rafterW,
                  ]}
                />
                <meshStandardMaterial color={rafterColor} metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Right rafter */}
              <mesh
                position={[width / 4, height + (ridgeHeight - height) / 2, z]}
                rotation={[0, 0, -Math.atan2(ridgeHeight - height, width / 2)]}
                castShadow
                receiveShadow
              >
                <boxGeometry
                  args={[
                    Math.sqrt(Math.pow(width / 2, 2) + Math.pow(ridgeHeight - height, 2)),
                    rafterD,
                    rafterW,
                  ]}
                />
                <meshStandardMaterial color={rafterColor} metalness={0.7} roughness={0.3} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Secondary Members */}
      <SecondaryMembers
        length={length}
        width={width}
        height={height}
        ridgeHeight={ridgeHeight}
        baySpacing={baySpacing}
        numBays={numBays}
        visible={claddingState.showSecondaryMembers}
        color={brandingState.structureColor.hex}
      />

      {/* Cladding */}
      <Suspense fallback={null}>
        <CladdingSystem
          length={length}
          width={width}
          height={height}
          ridgeHeight={ridgeHeight}
          showRoof={claddingState.showRoofCladding}
          showWalls={claddingState.showWallCladding}
          profile={claddingState.profile}
          skylightMode={claddingState.skylightMode}
          roofColor={brandingState.roofColor.hex}
          wallColor={brandingState.wallColor.hex}
        />
      </Suspense>

      {/* Accessories */}
      {ventilatorPositions.map((pos, i) => (
        <TurboVentilator key={`vent-${i}`} position={pos} />
      ))}

      <GuttersAndDownspouts
        length={length}
        width={width}
        height={height}
        visible={accessoryState.showGutters}
        color={brandingState.trimColor.hex}
      />

      <DoorsAndShutters
        placements={doorPlacements}
        buildingLength={length}
        buildingWidth={width}
        buildingHeight={height}
        visible={accessoryState.showDoors}
      />

      <XBracing
        length={length}
        width={width}
        height={height}
        baySpacing={baySpacing}
        numBays={numBays}
        bracedBays={accessoryState.bracedBays}
        visible={accessoryState.showBracing}
        color={brandingState.trimColor.hex}
      />

      {/* Signage */}
      <Suspense fallback={null}>
        <BuildingSignage
          text={brandingState.signageText}
          position={[0, height + (ridgeHeight - height) * 0.4, -length / 2 - 0.15]}
          color={brandingState.trimColor.hex}
          visible={brandingState.showSignage}
        />
      </Suspense>

      {/* Clearance Check */}
      {clearanceEnabled && (
        <ClearanceCheckBox
          preset={clearancePreset}
          buildingBounds={buildingBounds}
          structuralBounds={structuralBounds}
        />
      )}

      {/* Controls */}
      {isWalkthrough ? (
        <WalkthroughController
          buildingBounds={buildingBounds}
          onExit={onWalkthroughExit}
        />
      ) : (
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={5}
          maxDistance={200}
        />
      )}
    </>
  );
}

const BuildingSimulator = forwardRef<BuildingSimulatorHandle, BuildingSimulatorProps>(
  function BuildingSimulator(props, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const { onErectionStepChange, params } = props;

    useImperativeHandle(ref, () => ({
      playFullSequence: (onComplete: () => void) => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        let step = 0;
        const totalSteps = params.totalSteps;
        const fps = 30;
        const durationMs = 5000; // 5 seconds total
        const stepInterval = durationMs / totalSteps;
        let lastTime = performance.now();

        const animate = (now: number) => {
          if (now - lastTime >= stepInterval) {
            step++;
            onErectionStepChange?.(step);
            lastTime = now;
            if (step >= totalSteps) {
              onComplete();
              return;
            }
          }
          animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);
      },
      getCanvas: () => canvasRef.current,
    }));

    useEffect(() => {
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, []);

    return (
      <Canvas
        ref={canvasRef}
        shadows
        camera={{ position: [30, 20, 40], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <BuildingScene {...props} />
      </Canvas>
    );
  }
);

export default BuildingSimulator;
