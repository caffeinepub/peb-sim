/**
 * Client-side DXF parser for PEB building elements.
 * Parses ASCII DXF files to extract LINE entities from specific layers.
 * DXF format: alternating group code (integer) and value lines.
 */

export interface BuildingElement {
  id: string;
  layer: string;
  erection_order: number;
  start: { x: number; y: number; z: number };
  end: { x: number; y: number; z: number };
}

// Erection order mapping by layer name (case-insensitive)
const LAYER_ERECTION_ORDER: Record<string, number> = {
  ANCHOR_BOLT: 0,
  ANCHOR: 0,
  COLUMN: 1,
  RAFTER: 2,
  STRUT: 3,
  PURLIN: 4,
  GIRT: 5,
  SHEETING: 6,
};

// Color mapping for visualization
export const LAYER_COLORS: Record<string, string> = {
  ANCHOR_BOLT: '#f59e0b',
  ANCHOR: '#f59e0b',
  COLUMN: '#60a5fa',
  RAFTER: '#34d399',
  STRUT: '#a78bfa',
  PURLIN: '#fb923c',
  GIRT: '#f472b6',
  SHEETING: '#94a3b8',
};

export const ERECTION_STEP_LABELS: Record<number, string> = {
  0: 'Anchor Bolts',
  1: 'Main Columns',
  2: 'Rafters',
  3: 'Struts',
  4: 'Purlins',
  5: 'Girts',
  6: 'Sheeting',
};

function getErectionOrder(layerName: string): number | null {
  const upper = layerName.toUpperCase();
  // Exact match first
  if (LAYER_ERECTION_ORDER[upper] !== undefined) {
    return LAYER_ERECTION_ORDER[upper];
  }
  // Partial match
  for (const key of Object.keys(LAYER_ERECTION_ORDER)) {
    if (upper.includes(key)) {
      return LAYER_ERECTION_ORDER[key];
    }
  }
  return null;
}

interface DxfTag {
  code: number;
  value: string;
}

function parseTags(text: string): DxfTag[] {
  const lines = text.split(/\r?\n/);
  const tags: DxfTag[] = [];
  let i = 0;
  while (i < lines.length - 1) {
    const codeLine = lines[i].trim();
    const valueLine = lines[i + 1].trim();
    const code = parseInt(codeLine, 10);
    if (!isNaN(code)) {
      tags.push({ code, value: valueLine });
    }
    i += 2;
  }
  return tags;
}

export function parseDxf(fileText: string): BuildingElement[] {
  const tags = parseTags(fileText);
  const elements: BuildingElement[] = [];
  let elementCounter = 0;

  // Find ENTITIES section
  let inEntities = false;
  let i = 0;

  while (i < tags.length) {
    const tag = tags[i];

    // Detect section boundaries
    if (tag.code === 0 && tag.value === 'SECTION') {
      i++;
      if (i < tags.length && tags[i].code === 2 && tags[i].value === 'ENTITIES') {
        inEntities = true;
      }
      continue;
    }

    if (tag.code === 0 && tag.value === 'ENDSEC') {
      inEntities = false;
      i++;
      continue;
    }

    if (!inEntities) {
      i++;
      continue;
    }

    // Parse LINE entity
    if (tag.code === 0 && tag.value === 'LINE') {
      let layer = '';
      let x0 = 0, y0 = 0, z0 = 0;
      let x1 = 0, y1 = 0, z1 = 0;

      i++;
      // Read entity properties until next entity or section end
      while (i < tags.length && !(tags[i].code === 0)) {
        const t = tags[i];
        switch (t.code) {
          case 8:  layer = t.value; break;
          case 10: x0 = parseFloat(t.value); break;
          case 20: y0 = parseFloat(t.value); break;
          case 30: z0 = parseFloat(t.value); break;
          case 11: x1 = parseFloat(t.value); break;
          case 21: y1 = parseFloat(t.value); break;
          case 31: z1 = parseFloat(t.value); break;
        }
        i++;
      }

      const erection_order = getErectionOrder(layer);
      if (erection_order !== null) {
        elements.push({
          id: `elem_${elementCounter++}`,
          layer: layer.toUpperCase(),
          erection_order,
          start: { x: x0, y: y0, z: z0 },
          end: { x: x1, y: y1, z: z1 },
        });
      }
      continue;
    }

    // Parse LWPOLYLINE entity (treat as line segments)
    if (tag.code === 0 && tag.value === 'LWPOLYLINE') {
      let layer = '';
      const vertices: { x: number; y: number }[] = [];
      let currentX = 0, currentY = 0;
      let hasX = false;

      i++;
      while (i < tags.length && !(tags[i].code === 0)) {
        const t = tags[i];
        switch (t.code) {
          case 8: layer = t.value; break;
          case 10:
            if (hasX) {
              vertices.push({ x: currentX, y: currentY });
            }
            currentX = parseFloat(t.value);
            hasX = true;
            break;
          case 20:
            currentY = parseFloat(t.value);
            break;
        }
        i++;
      }
      if (hasX) {
        vertices.push({ x: currentX, y: currentY });
      }

      const erection_order = getErectionOrder(layer);
      if (erection_order !== null && vertices.length >= 2) {
        for (let v = 0; v < vertices.length - 1; v++) {
          elements.push({
            id: `elem_${elementCounter++}`,
            layer: layer.toUpperCase(),
            erection_order,
            start: { x: vertices[v].x, y: vertices[v].y, z: 0 },
            end: { x: vertices[v + 1].x, y: vertices[v + 1].y, z: 0 },
          });
        }
      }
      continue;
    }

    i++;
  }

  return elements;
}

export function generateSampleBuilding(): BuildingElement[] {
  const elements: BuildingElement[] = [];
  let id = 0;

  const W = 20; // width
  const L = 40; // length
  const H = 6;  // eave height
  const RIDGE = 8; // ridge height
  const BAYS = 4;
  const BAY_SPACING = L / BAYS;
  const PURLIN_SPACING = 1.5;

  // Anchor bolts (step 0)
  for (let b = 0; b <= BAYS; b++) {
    const z = b * BAY_SPACING;
    elements.push({ id: `elem_${id++}`, layer: 'ANCHOR_BOLT', erection_order: 0, start: { x: 0, y: 0, z }, end: { x: 0, y: 0.3, z } });
    elements.push({ id: `elem_${id++}`, layer: 'ANCHOR_BOLT', erection_order: 0, start: { x: W, y: 0, z }, end: { x: W, y: 0.3, z } });
  }

  // Columns (step 1)
  for (let b = 0; b <= BAYS; b++) {
    const z = b * BAY_SPACING;
    elements.push({ id: `elem_${id++}`, layer: 'COLUMN', erection_order: 1, start: { x: 0, y: 0, z }, end: { x: 0, y: H, z } });
    elements.push({ id: `elem_${id++}`, layer: 'COLUMN', erection_order: 1, start: { x: W, y: 0, z }, end: { x: W, y: H, z } });
  }

  // Rafters (step 2)
  for (let b = 0; b <= BAYS; b++) {
    const z = b * BAY_SPACING;
    elements.push({ id: `elem_${id++}`, layer: 'RAFTER', erection_order: 2, start: { x: 0, y: H, z }, end: { x: W / 2, y: RIDGE, z } });
    elements.push({ id: `elem_${id++}`, layer: 'RAFTER', erection_order: 2, start: { x: W / 2, y: RIDGE, z }, end: { x: W, y: H, z } });
  }

  // Struts (step 3)
  for (let b = 0; b < BAYS; b++) {
    const z1 = b * BAY_SPACING;
    const z2 = (b + 1) * BAY_SPACING;
    const midZ = (z1 + z2) / 2;
    elements.push({ id: `elem_${id++}`, layer: 'STRUT', erection_order: 3, start: { x: 0, y: H * 0.6, z: z1 }, end: { x: 0, y: H * 0.6, z: z2 } });
    elements.push({ id: `elem_${id++}`, layer: 'STRUT', erection_order: 3, start: { x: W, y: H * 0.6, z: z1 }, end: { x: W, y: H * 0.6, z: z2 } });
    elements.push({ id: `elem_${id++}`, layer: 'STRUT', erection_order: 3, start: { x: W / 2, y: RIDGE * 0.8, z: z1 }, end: { x: W / 2, y: RIDGE * 0.8, z: z2 } });
  }

  // Purlins (step 4) - along roof slope
  const numPurlins = Math.floor((Math.sqrt((W / 2) ** 2 + (RIDGE - H) ** 2)) / PURLIN_SPACING);
  for (let p = 1; p <= numPurlins; p++) {
    const t = p / (numPurlins + 1);
    const px_left = t * (W / 2);
    const py_left = H + t * (RIDGE - H);
    const px_right = W - t * (W / 2);
    const py_right = H + t * (RIDGE - H);
    elements.push({ id: `elem_${id++}`, layer: 'PURLIN', erection_order: 4, start: { x: px_left, y: py_left, z: 0 }, end: { x: px_left, y: py_left, z: L } });
    elements.push({ id: `elem_${id++}`, layer: 'PURLIN', erection_order: 4, start: { x: px_right, y: py_right, z: 0 }, end: { x: px_right, y: py_right, z: L } });
  }

  // Girts (step 5) - along walls
  const numGirts = Math.floor(H / PURLIN_SPACING);
  for (let g = 1; g <= numGirts; g++) {
    const gy = (g / (numGirts + 1)) * H;
    elements.push({ id: `elem_${id++}`, layer: 'GIRT', erection_order: 5, start: { x: 0, y: gy, z: 0 }, end: { x: 0, y: gy, z: L } });
    elements.push({ id: `elem_${id++}`, layer: 'GIRT', erection_order: 5, start: { x: W, y: gy, z: 0 }, end: { x: W, y: gy, z: L } });
  }

  return elements;
}
