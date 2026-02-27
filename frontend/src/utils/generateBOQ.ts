import type { BuildingDimensions, MemberDimensions, OpeningData } from "./calculateBuildingStats";

export interface BOQItem {
  partName: string;
  quantity: number;
  dimensions: string;
  unitWeight: number; // kg
  totalWeight: number; // kg
}

const STEEL_DENSITY = 7850; // kg/m³

export function generateBOQItems(
  dims: BuildingDimensions,
  members: MemberDimensions,
  openings: OpeningData
): BOQItem[] {
  const items: BOQItem[] = [];

  // Columns
  const colVolume = members.columnWidth * members.columnDepth * members.columnHeight;
  const colUnitWeight = Math.round(colVolume * STEEL_DENSITY);
  items.push({
    partName: "Main Frame Column (I-Section)",
    quantity: members.columnCount,
    dimensions: `${(members.columnWidth * 1000).toFixed(0)}×${(members.columnDepth * 1000).toFixed(0)}×${(members.columnHeight * 1000).toFixed(0)} mm`,
    unitWeight: colUnitWeight,
    totalWeight: colUnitWeight * members.columnCount,
  });

  // Rafters
  const rafterVolume = members.rafterWidth * members.rafterDepth * members.rafterLength;
  const rafterUnitWeight = Math.round(rafterVolume * STEEL_DENSITY);
  items.push({
    partName: "Main Frame Rafter (Tapered I-Section)",
    quantity: members.rafterCount,
    dimensions: `${(members.rafterWidth * 1000).toFixed(0)}×${(members.rafterDepth * 1000).toFixed(0)}×${(members.rafterLength * 1000).toFixed(0)} mm`,
    unitWeight: rafterUnitWeight,
    totalWeight: rafterUnitWeight * members.rafterCount,
  });

  // Z-Purlins
  const purlinSpacing = 1.5;
  const purlinCount = Math.ceil((dims.ridgeHeight - dims.height) / purlinSpacing) * 2 * dims.numBays;
  const purlinLength = dims.width / 2;
  const purlinUnitWeight = Math.round(0.08 * 0.04 * purlinLength * STEEL_DENSITY);
  items.push({
    partName: "Z-Purlin (200×65×20×2.5mm)",
    quantity: purlinCount,
    dimensions: `200×65×20×2.5 mm × ${purlinLength.toFixed(1)} m`,
    unitWeight: purlinUnitWeight,
    totalWeight: purlinUnitWeight * purlinCount,
  });

  // C-Girts
  const girtSpacing = 1.5;
  const girtCount = Math.ceil(dims.height / girtSpacing) * 2 * (dims.numBays + 1);
  const girtLength = dims.baySpacing;
  const girtUnitWeight = Math.round(0.08 * 0.04 * girtLength * STEEL_DENSITY);
  items.push({
    partName: "C-Girt (200×65×20×2.5mm)",
    quantity: girtCount,
    dimensions: `200×65×20×2.5 mm × ${girtLength.toFixed(1)} m`,
    unitWeight: girtUnitWeight,
    totalWeight: girtUnitWeight * girtCount,
  });

  // Roof Cladding
  const roofSlopeLength = Math.sqrt(
    Math.pow(dims.width / 2, 2) + Math.pow(dims.ridgeHeight - dims.height, 2)
  );
  const roofArea = roofSlopeLength * 2 * dims.length;
  const roofCladdingWeight = Math.round(roofArea * 5.5); // ~5.5 kg/m² for trapezoidal sheet
  items.push({
    partName: "Roof Cladding Sheet (0.5mm Trapezoidal)",
    quantity: 1,
    dimensions: `${roofArea.toFixed(1)} m²`,
    unitWeight: roofCladdingWeight,
    totalWeight: roofCladdingWeight,
  });

  // Wall Cladding
  const frontWallArea = dims.width * dims.height + 0.5 * dims.width * (dims.ridgeHeight - dims.height);
  const sideWallArea = dims.length * dims.height;
  const totalWallArea = frontWallArea * 2 + sideWallArea * 2;
  const doorOpeningArea =
    openings.doorCount * openings.doorWidth * openings.doorHeight +
    openings.shutterCount * openings.shutterWidth * openings.shutterHeight;
  const netWallArea = totalWallArea - doorOpeningArea;
  const wallCladdingWeight = Math.round(netWallArea * 5.5);
  items.push({
    partName: "Wall Cladding Sheet (0.5mm Trapezoidal)",
    quantity: 1,
    dimensions: `${netWallArea.toFixed(1)} m²`,
    unitWeight: wallCladdingWeight,
    totalWeight: wallCladdingWeight,
  });

  // Rolling Shutters
  if (openings.shutterCount > 0) {
    const shutterUnitWeight = Math.round(openings.shutterWidth * openings.shutterHeight * 15);
    items.push({
      partName: "Rolling Shutter",
      quantity: openings.shutterCount,
      dimensions: `${openings.shutterWidth.toFixed(1)}×${openings.shutterHeight.toFixed(1)} m`,
      unitWeight: shutterUnitWeight,
      totalWeight: shutterUnitWeight * openings.shutterCount,
    });
  }

  // Personnel Doors
  if (openings.doorCount > 0) {
    const doorUnitWeight = 45;
    items.push({
      partName: "Personnel Door (Steel Frame)",
      quantity: openings.doorCount,
      dimensions: `${openings.doorWidth.toFixed(1)}×${openings.doorHeight.toFixed(1)} m`,
      unitWeight: doorUnitWeight,
      totalWeight: doorUnitWeight * openings.doorCount,
    });
  }

  return items;
}

export function generateBOQCSV(
  projectName: string,
  items: BOQItem[]
): string {
  const header = "Part Name,Quantity,Dimensions,Unit Weight (kg),Total Weight (kg)\n";
  const rows = items.map(item =>
    `"${item.partName}",${item.quantity},"${item.dimensions}",${item.unitWeight},${item.totalWeight}`
  ).join("\n");

  const totalWeight = items.reduce((sum, item) => sum + item.totalWeight, 0);
  const totalsRow = `"TOTAL",,,,${totalWeight}`;

  return header + rows + "\n" + totalsRow;
}

export function downloadBOQCSV(projectName: string, items: BOQItem[]): void {
  const csv = generateBOQCSV(projectName, items);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `BOQ_${projectName.replace(/\s+/g, "_")}_${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
