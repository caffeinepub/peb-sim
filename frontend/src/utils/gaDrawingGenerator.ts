// GA Drawing Generator - generates SVG views from building state

export interface BuildingState {
  span: number;
  length: number;
  height: number;
  baySpacing: number;
  numBays: number;
  roofPitch: number;
  purlinSpacing: number;
}

const MARGIN = 60;
const WIDTH = 800;
const HEIGHT = 600;
const DRAW_W = WIDTH - MARGIN * 2;
const DRAW_H = HEIGHT - MARGIN * 2;

function titleBlock(title: string, scale: string, buildingState: BuildingState): string {
  return `
    <rect x="0" y="${HEIGHT - 50}" width="${WIDTH}" height="50" fill="#1a2744" />
    <text x="10" y="${HEIGHT - 30}" fill="white" font-size="12" font-family="monospace" font-weight="bold">${title}</text>
    <text x="10" y="${HEIGHT - 12}" fill="#aab" font-size="10" font-family="monospace">Scale: ${scale} | Span: ${buildingState.span}m | Length: ${buildingState.length}m | Height: ${buildingState.height}m</text>
    <text x="${WIDTH - 10}" y="${HEIGHT - 12}" fill="#aab" font-size="10" font-family="monospace" text-anchor="end">PEB-Sim GA Drawings</text>
  `;
}

function dimLine(x1: number, y1: number, x2: number, y2: number, label: string, offset = 20): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#f59e0b" stroke-width="1" stroke-dasharray="4,2"/>
    <text x="${mx}" y="${my - offset}" fill="#f59e0b" font-size="10" font-family="monospace" text-anchor="middle">${label}</text>
  `;
}

export function generateAnchorBoltPlan(bs: BuildingState): string {
  const scaleX = DRAW_W / (bs.length + 4);
  const scaleY = DRAW_H / (bs.span + 4);
  const scale = Math.min(scaleX, scaleY);
  const offX = MARGIN + (DRAW_W - bs.length * scale) / 2;
  const offY = MARGIN + (DRAW_H - bs.span * scale) / 2;

  let cols = '';
  const numBays = Math.max(1, Math.round(bs.length / bs.baySpacing));
  for (let i = 0; i <= numBays; i++) {
    const x = offX + (i * bs.baySpacing) * scale;
    // Left column
    const y1 = offY;
    // Right column
    const y2 = offY + bs.span * scale;
    // Draw column base circles
    cols += `<circle cx="${x}" cy="${y1}" r="8" fill="none" stroke="#60a5fa" stroke-width="2"/>`;
    cols += `<circle cx="${x}" cy="${y2}" r="8" fill="none" stroke="#60a5fa" stroke-width="2"/>`;
    // Anchor bolts (4 per base)
    for (const [dx, dy] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) {
      cols += `<circle cx="${x + dx}" cy="${y1 + dy}" r="2" fill="#f59e0b"/>`;
      cols += `<circle cx="${x + dx}" cy="${y2 + dy}" r="2" fill="#f59e0b"/>`;
    }
    // Pedestal outline
    cols += `<rect x="${x - 12}" y="${y1 - 12}" width="24" height="24" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,2"/>`;
    cols += `<rect x="${x - 12}" y="${y2 - 12}" width="24" height="24" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,2"/>`;
    // Labels
    cols += `<text x="${x}" y="${y1 - 18}" fill="#e2e8f0" font-size="9" font-family="monospace" text-anchor="middle">C${i + 1}L</text>`;
    cols += `<text x="${x}" y="${y2 + 26}" fill="#e2e8f0" font-size="9" font-family="monospace" text-anchor="middle">C${i + 1}R</text>`;
    // Reaction labels
    cols += `<text x="${x + 14}" y="${y1 + 4}" fill="#34d399" font-size="8" font-family="monospace">R=${Math.round(bs.height * 12)}kN</text>`;
  }

  // Grid lines
  let grid = '';
  for (let i = 0; i <= numBays; i++) {
    const x = offX + (i * bs.baySpacing) * scale;
    grid += `<line x1="${x}" y1="${offY - 20}" x2="${x}" y2="${offY + bs.span * scale + 20}" stroke="#334155" stroke-width="1" stroke-dasharray="6,3"/>`;
    grid += `<text x="${x}" y="${offY - 25}" fill="#64748b" font-size="9" font-family="monospace" text-anchor="middle">GL-${i + 1}</text>`;
  }
  // Span grid lines
  grid += `<line x1="${offX - 20}" y1="${offY}" x2="${offX + bs.length * scale + 20}" y2="${offY}" stroke="#334155" stroke-width="1" stroke-dasharray="6,3"/>`;
  grid += `<line x1="${offX - 20}" y1="${offY + bs.span * scale}" x2="${offX + bs.length * scale + 20}" y2="${offY + bs.span * scale}" stroke="#334155" stroke-width="1" stroke-dasharray="6,3"/>`;

  // Dimension lines
  const dimSpan = dimLine(offX - 30, offY, offX - 30, offY + bs.span * scale, `${bs.span}m`, -5);
  const dimLen = dimLine(offX, offY + bs.span * scale + 30, offX + bs.length * scale, offY + bs.span * scale + 30, `${bs.length}m`, -5);

  // Legend
  const legend = `
    <circle cx="${MARGIN + 10}" cy="20" r="4" fill="none" stroke="#60a5fa" stroke-width="2"/>
    <text x="${MARGIN + 18}" y="24" fill="#e2e8f0" font-size="9" font-family="monospace">Column Base</text>
    <circle cx="${MARGIN + 90}" cy="20" r="2" fill="#f59e0b"/>
    <text x="${MARGIN + 96}" y="24" fill="#e2e8f0" font-size="9" font-family="monospace">Anchor Bolt</text>
    <rect x="${MARGIN + 170}" y="14" width="12" height="12" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,2"/>
    <text x="${MARGIN + 186}" y="24" fill="#e2e8f0" font-size="9" font-family="monospace">Pedestal</text>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" style="background:#0f172a">
    ${grid}${cols}${dimSpan}${dimLen}${legend}
    ${titleBlock('ANCHOR BOLT PLAN', '1:100', bs)}
  </svg>`;
}

export function generateCrossSection(bs: BuildingState): string {
  const halfSpan = bs.span / 2;
  const ridgeH = bs.height + halfSpan * Math.tan((bs.roofPitch * Math.PI) / 180);
  const maxH = ridgeH + 2;
  const scaleX = DRAW_W / (bs.span + 4);
  const scaleY = (DRAW_H - 60) / (maxH + 2);
  const scale = Math.min(scaleX, scaleY);
  const offX = MARGIN + (DRAW_W - bs.span * scale) / 2;
  const baseY = MARGIN + 20 + maxH * scale;

  // Column positions
  const lx = offX;
  const rx = offX + bs.span * scale;
  const colTopY = baseY - bs.height * scale;
  const ridgeY = baseY - ridgeH * scale;

  // Ground line
  const ground = `<line x1="${offX - 30}" y1="${baseY}" x2="${rx + 30}" y2="${baseY}" stroke="#4ade80" stroke-width="2"/>`;
  // Hatching below ground
  let hatch = '';
  for (let i = 0; i < 8; i++) {
    hatch += `<line x1="${offX - 30 + i * 20}" y1="${baseY}" x2="${offX - 30 + i * 20 - 15}" y2="${baseY + 15}" stroke="#4ade80" stroke-width="1" opacity="0.4"/>`;
  }

  // Columns
  const cols = `
    <rect x="${lx - 4}" y="${colTopY}" width="8" height="${bs.height * scale}" fill="#3b82f6" opacity="0.8"/>
    <rect x="${rx - 4}" y="${colTopY}" width="8" height="${bs.height * scale}" fill="#3b82f6" opacity="0.8"/>
  `;

  // Rafters
  const rafters = `
    <line x1="${lx}" y1="${colTopY}" x2="${offX + halfSpan * scale}" y2="${ridgeY}" stroke="#60a5fa" stroke-width="6"/>
    <line x1="${rx}" y1="${colTopY}" x2="${offX + halfSpan * scale}" y2="${ridgeY}" stroke="#60a5fa" stroke-width="6"/>
  `;

  // Haunch indicators
  const haunch = `
    <polygon points="${lx},${colTopY} ${lx + 20},${colTopY} ${lx},${colTopY - 20}" fill="#f59e0b" opacity="0.7"/>
    <polygon points="${rx},${colTopY} ${rx - 20},${colTopY} ${rx},${colTopY - 20}" fill="#f59e0b" opacity="0.7"/>
  `;

  // Ridge
  const ridge = `<circle cx="${offX + halfSpan * scale}" cy="${ridgeY}" r="5" fill="#f59e0b"/>`;

  // Purlins
  let purlins = '';
  const numPurlins = Math.floor(halfSpan / bs.purlinSpacing);
  for (let side = 0; side < 2; side++) {
    for (let i = 1; i <= numPurlins; i++) {
      const t = i / (numPurlins + 1);
      const px = side === 0
        ? lx + t * halfSpan * scale
        : offX + halfSpan * scale + t * halfSpan * scale;
      const py = side === 0
        ? colTopY - t * (colTopY - ridgeY)
        : ridgeY + t * (colTopY - ridgeY);
      purlins += `<circle cx="${px}" cy="${py}" r="3" fill="#94a3b8"/>`;
    }
  }

  // Dimension lines
  const dimSpan = `
    <line x1="${lx}" y1="${baseY + 15}" x2="${rx}" y2="${baseY + 15}" stroke="#f59e0b" stroke-width="1"/>
    <text x="${(lx + rx) / 2}" y="${baseY + 28}" fill="#f59e0b" font-size="11" font-family="monospace" text-anchor="middle">SPAN = ${bs.span}m</text>
  `;
  const dimHeight = `
    <line x1="${lx - 25}" y1="${colTopY}" x2="${lx - 25}" y2="${baseY}" stroke="#f59e0b" stroke-width="1"/>
    <text x="${lx - 30}" y="${(colTopY + baseY) / 2}" fill="#f59e0b" font-size="11" font-family="monospace" text-anchor="end">${bs.height}m</text>
  `;
  const dimRidge = `
    <line x1="${rx + 25}" y1="${ridgeY}" x2="${rx + 25}" y2="${baseY}" stroke="#f59e0b" stroke-width="1"/>
    <text x="${rx + 30}" y="${(ridgeY + baseY) / 2}" fill="#f59e0b" font-size="11" font-family="monospace">${ridgeH.toFixed(1)}m</text>
  `;

  // Labels
  const labels = `
    <text x="${lx}" y="${colTopY - 30}" fill="#e2e8f0" font-size="9" font-family="monospace" text-anchor="middle">HAUNCH</text>
    <text x="${offX + halfSpan * scale}" y="${ridgeY - 12}" fill="#e2e8f0" font-size="9" font-family="monospace" text-anchor="middle">RIDGE</text>
    <text x="${lx}" y="${baseY + 45}" fill="#e2e8f0" font-size="9" font-family="monospace" text-anchor="middle">BASE PLATE</text>
    <text x="${rx}" y="${baseY + 45}" fill="#e2e8f0" font-size="9" font-family="monospace" text-anchor="middle">BASE PLATE</text>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" style="background:#0f172a">
    ${ground}${hatch}${cols}${rafters}${haunch}${ridge}${purlins}
    ${dimSpan}${dimHeight}${dimRidge}${labels}
    ${titleBlock('CROSS SECTION', '1:100', bs)}
  </svg>`;
}

export function generateRoofPlan(bs: BuildingState): string {
  const scaleX = DRAW_W / (bs.length + 4);
  const scaleY = DRAW_H / (bs.span + 4);
  const scale = Math.min(scaleX, scaleY);
  const offX = MARGIN + (DRAW_W - bs.length * scale) / 2;
  const offY = MARGIN + (DRAW_H - bs.span * scale) / 2;
  const numBays = Math.max(1, Math.round(bs.length / bs.baySpacing));

  // Roof outline
  const outline = `<rect x="${offX}" y="${offY}" width="${bs.length * scale}" height="${bs.span * scale}" fill="none" stroke="#60a5fa" stroke-width="2"/>`;

  // Ridge line
  const ridgeX1 = offX;
  const ridgeX2 = offX + bs.length * scale;
  const ridgeY = offY + (bs.span / 2) * scale;
  const ridgeLine = `<line x1="${ridgeX1}" y1="${ridgeY}" x2="${ridgeX2}" y2="${ridgeY}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="8,4"/>`;

  // Purlins
  let purlins = '';
  const numPurlins = Math.floor((bs.span / 2) / bs.purlinSpacing);
  for (let i = 1; i <= numPurlins; i++) {
    const yOff = i * bs.purlinSpacing * scale;
    // Top half
    purlins += `<line x1="${offX}" y1="${offY + yOff}" x2="${offX + bs.length * scale}" y2="${offY + yOff}" stroke="#94a3b8" stroke-width="1"/>`;
    // Bottom half
    purlins += `<line x1="${offX}" y1="${ridgeY + yOff}" x2="${offX + bs.length * scale}" y2="${ridgeY + yOff}" stroke="#94a3b8" stroke-width="1"/>`;
  }

  // Bay lines
  let bayLines = '';
  for (let i = 0; i <= numBays; i++) {
    const x = offX + i * bs.baySpacing * scale;
    bayLines += `<line x1="${x}" y1="${offY}" x2="${x}" y2="${offY + bs.span * scale}" stroke="#334155" stroke-width="1.5"/>`;
  }

  // X-Bracing (end bays)
  const bw = bs.baySpacing * scale;
  const bh = bs.span * scale;
  const bracing = `
    <line x1="${offX}" y1="${offY}" x2="${offX + bw}" y2="${offY + bh}" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5,3"/>
    <line x1="${offX + bw}" y1="${offY}" x2="${offX}" y2="${offY + bh}" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5,3"/>
    <line x1="${offX + bs.length * scale - bw}" y1="${offY}" x2="${offX + bs.length * scale}" y2="${offY + bh}" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5,3"/>
    <line x1="${offX + bs.length * scale}" y1="${offY}" x2="${offX + bs.length * scale - bw}" y2="${offY + bh}" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5,3"/>
  `;

  // Dimension lines
  const dimLen = `
    <line x1="${offX}" y1="${offY - 20}" x2="${offX + bs.length * scale}" y2="${offY - 20}" stroke="#f59e0b" stroke-width="1"/>
    <text x="${offX + (bs.length * scale) / 2}" y="${offY - 25}" fill="#f59e0b" font-size="11" font-family="monospace" text-anchor="middle">LENGTH = ${bs.length}m</text>
  `;
  const dimSpan = `
    <line x1="${offX - 20}" y1="${offY}" x2="${offX - 20}" y2="${offY + bs.span * scale}" stroke="#f59e0b" stroke-width="1"/>
    <text x="${offX - 25}" y="${offY + (bs.span * scale) / 2}" fill="#f59e0b" font-size="11" font-family="monospace" text-anchor="end">SPAN=${bs.span}m</text>
  `;

  // Legend
  const legend = `
    <line x1="${MARGIN}" y1="20" x2="${MARGIN + 20}" y2="20" stroke="#94a3b8" stroke-width="1"/>
    <text x="${MARGIN + 24}" y="24" fill="#e2e8f0" font-size="9" font-family="monospace">Purlin @ ${bs.purlinSpacing}m</text>
    <line x1="${MARGIN + 110}" y1="20" x2="${MARGIN + 130}" y2="20" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5,3"/>
    <text x="${MARGIN + 134}" y="24" fill="#e2e8f0" font-size="9" font-family="monospace">X-Bracing</text>
    <line x1="${MARGIN + 210}" y1="20" x2="${MARGIN + 230}" y2="20" stroke="#f59e0b" stroke-width="2" stroke-dasharray="8,4"/>
    <text x="${MARGIN + 234}" y="24" fill="#e2e8f0" font-size="9" font-family="monospace">Ridge</text>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" style="background:#0f172a">
    ${outline}${ridgeLine}${purlins}${bayLines}${bracing}
    ${dimLen}${dimSpan}${legend}
    ${titleBlock('ROOF PLAN', '1:200', bs)}
  </svg>`;
}

export function generateSideElevation(bs: BuildingState): string {
  const halfSpan = bs.span / 2;
  const ridgeH = bs.height + halfSpan * Math.tan((bs.roofPitch * Math.PI) / 180);
  const maxH = ridgeH + 2;
  const scaleX = DRAW_W / (bs.length + 4);
  const scaleY = (DRAW_H - 60) / (maxH + 2);
  const scale = Math.min(scaleX, scaleY);
  const offX = MARGIN + (DRAW_W - bs.length * scale) / 2;
  const baseY = MARGIN + 20 + maxH * scale;
  const numBays = Math.max(1, Math.round(bs.length / bs.baySpacing));

  // Ground line
  const ground = `<line x1="${offX - 20}" y1="${baseY}" x2="${offX + bs.length * scale + 20}" y2="${baseY}" stroke="#4ade80" stroke-width="2"/>`;

  // Columns
  let cols = '';
  for (let i = 0; i <= numBays; i++) {
    const x = offX + i * bs.baySpacing * scale;
    cols += `<rect x="${x - 3}" y="${baseY - bs.height * scale}" width="6" height="${bs.height * scale}" fill="#3b82f6" opacity="0.8"/>`;
  }

  // Roof profile
  const roofY = baseY - ridgeH * scale;
  const roofPath = `M ${offX} ${baseY - bs.height * scale} L ${offX + (bs.length * scale) / 2} ${roofY} L ${offX + bs.length * scale} ${baseY - bs.height * scale}`;
  const roof = `<path d="${roofPath}" fill="none" stroke="#60a5fa" stroke-width="3"/>`;

  // Wall bracing (X-bracing in end bays)
  const bw = bs.baySpacing * scale;
  const bh = bs.height * scale;
  const wallBracing = `
    <line x1="${offX}" y1="${baseY}" x2="${offX + bw}" y2="${baseY - bh}" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5,3"/>
    <line x1="${offX + bw}" y1="${baseY}" x2="${offX}" y2="${baseY - bh}" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5,3"/>
    <line x1="${offX + bs.length * scale - bw}" y1="${baseY}" x2="${offX + bs.length * scale}" y2="${baseY - bh}" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5,3"/>
    <line x1="${offX + bs.length * scale}" y1="${baseY}" x2="${offX + bs.length * scale - bw}" y2="${baseY - bh}" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5,3"/>
  `;

  // Bay dimension lines
  let bayDims = '';
  for (let i = 0; i < numBays; i++) {
    const x1 = offX + i * bs.baySpacing * scale;
    const x2 = offX + (i + 1) * bs.baySpacing * scale;
    bayDims += `<line x1="${x1}" y1="${baseY + 15}" x2="${x2}" y2="${baseY + 15}" stroke="#f59e0b" stroke-width="1"/>`;
    bayDims += `<text x="${(x1 + x2) / 2}" y="${baseY + 28}" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle">${bs.baySpacing}m</text>`;
  }

  // Height dimension
  const heightDim = `
    <line x1="${offX - 25}" y1="${baseY - bs.height * scale}" x2="${offX - 25}" y2="${baseY}" stroke="#f59e0b" stroke-width="1"/>
    <text x="${offX - 30}" y="${baseY - (bs.height * scale) / 2}" fill="#f59e0b" font-size="10" font-family="monospace" text-anchor="end">${bs.height}m</text>
  `;

  // Total length
  const lenDim = `
    <line x1="${offX}" y1="${baseY + 40}" x2="${offX + bs.length * scale}" y2="${baseY + 40}" stroke="#f59e0b" stroke-width="1"/>
    <text x="${offX + (bs.length * scale) / 2}" y="${baseY + 53}" fill="#f59e0b" font-size="11" font-family="monospace" text-anchor="middle">TOTAL LENGTH = ${bs.length}m</text>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" style="background:#0f172a">
    ${ground}${cols}${roof}${wallBracing}${bayDims}${heightDim}${lenDim}
    ${titleBlock('SIDE ELEVATION', '1:200', bs)}
  </svg>`;
}
