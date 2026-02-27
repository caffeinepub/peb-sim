export interface BuildingDimensions {
  length: number; // meters
  width: number;  // meters
  height: number; // meters (eave height)
  ridgeHeight: number; // meters
  baySpacing: number; // meters
  numBays: number;
}

export interface MemberDimensions {
  columnWidth: number;   // m
  columnDepth: number;   // m
  columnHeight: number;  // m
  columnCount: number;
  rafterWidth: number;   // m
  rafterDepth: number;   // m
  rafterLength: number;  // m
  rafterCount: number;
}

export interface OpeningData {
  doorCount: number;
  doorWidth: number;  // m
  doorHeight: number; // m
  shutterCount: number;
  shutterWidth: number;  // m
  shutterHeight: number; // m
}

export interface LoadInputs {
  windSpeed: number;    // km/h
  seismicZone: string; // I, II, III, IV, V
  liveLoad: number;    // kN/m²
}

export interface BuildingStats {
  steelWeight: number;       // kg
  sheetingArea: number;      // m²
  roofArea: number;          // m²
  wallArea: number;          // m²
  designStatus: "Safe" | "Requires Validation";
  designNotes: string[];
}

const STEEL_DENSITY = 7850; // kg/m³

export function calculateBuildingStats(
  dims: BuildingDimensions,
  members: MemberDimensions,
  openings: OpeningData,
  loads: LoadInputs
): BuildingStats {
  // Steel weight estimation
  const columnVolume =
    members.columnWidth *
    members.columnDepth *
    members.columnHeight *
    members.columnCount;

  const rafterVolume =
    members.rafterWidth *
    members.rafterDepth *
    members.rafterLength *
    members.rafterCount;

  // Purlins: estimate based on bay count
  const purlinSpacing = 1.5; // m
  const purlinCount = Math.ceil((dims.ridgeHeight - dims.height) / purlinSpacing) * 2 * dims.numBays;
  const purlinLength = dims.width / 2;
  const purlinVolume = 0.08 * 0.04 * purlinLength * purlinCount;

  // Girts: estimate based on wall height
  const girtSpacing = 1.5; // m
  const girtCount = Math.ceil(dims.height / girtSpacing) * 2 * (dims.numBays + 1);
  const girtLength = dims.baySpacing;
  const girtVolume = 0.08 * 0.04 * girtLength * girtCount;

  const totalVolume = columnVolume + rafterVolume + purlinVolume + girtVolume;
  const steelWeight = totalVolume * STEEL_DENSITY;

  // Sheeting area calculation
  const roofSlopeLength = Math.sqrt(
    Math.pow(dims.width / 2, 2) + Math.pow(dims.ridgeHeight - dims.height, 2)
  );
  const roofArea = roofSlopeLength * 2 * dims.length;

  const frontWallArea = dims.width * dims.height + 0.5 * dims.width * (dims.ridgeHeight - dims.height);
  const backWallArea = frontWallArea;
  const sideWallArea = dims.length * dims.height;
  const totalWallArea = frontWallArea + backWallArea + sideWallArea * 2;

  const doorOpeningArea =
    openings.doorCount * openings.doorWidth * openings.doorHeight +
    openings.shutterCount * openings.shutterWidth * openings.shutterHeight;

  const sheetingArea = roofArea + totalWallArea - doorOpeningArea;

  // Load simulation (IS 800 / MBMA heuristics)
  const designNotes: string[] = [];
  let requiresValidation = false;

  const seismicZoneNum = { I: 1, II: 2, III: 3, IV: 4, V: 5 }[loads.seismicZone] ?? 0;

  if (loads.windSpeed > 150) {
    requiresValidation = true;
    designNotes.push(`Wind speed ${loads.windSpeed} km/h exceeds 150 km/h threshold`);
  }
  if (seismicZoneNum >= 4) {
    requiresValidation = true;
    designNotes.push(`Seismic Zone ${loads.seismicZone} requires detailed analysis`);
  }
  if (loads.liveLoad > 2.0) {
    requiresValidation = true;
    designNotes.push(`Live load ${loads.liveLoad} kN/m² exceeds 2.0 kN/m² threshold`);
  }
  if (dims.height > 12) {
    requiresValidation = true;
    designNotes.push(`Eave height ${dims.height}m exceeds 12m — requires detailed design`);
  }
  if (dims.length > 60 || dims.width > 40) {
    requiresValidation = true;
    designNotes.push("Large span building requires detailed structural analysis");
  }

  if (!requiresValidation) {
    designNotes.push("Basic heuristic checks passed — IS 800 / MBMA compliant range");
  }

  return {
    steelWeight: Math.round(steelWeight),
    sheetingArea: Math.round(sheetingArea * 10) / 10,
    roofArea: Math.round(roofArea * 10) / 10,
    wallArea: Math.round(totalWallArea * 10) / 10,
    designStatus: requiresValidation ? "Requires Validation" : "Safe",
    designNotes,
  };
}
