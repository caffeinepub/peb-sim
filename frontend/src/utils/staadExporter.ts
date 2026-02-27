// STAAD.Pro .std file exporter

export interface Node {
  id: number;
  x: number;
  y: number;
  z: number;
}

export interface Member {
  id: number;
  startNode: number;
  endNode: number;
  type: 'column' | 'rafter' | 'purlin' | 'bracing';
}

export interface StaadGeometry {
  nodes: Node[];
  members: Member[];
  projectName: string;
}

export function buildGeometryFromState(
  span: number,
  length: number,
  height: number,
  baySpacing: number,
  roofPitch: number
): StaadGeometry {
  const nodes: Node[] = [];
  const members: Member[] = [];
  const numBays = Math.max(1, Math.round(length / baySpacing));
  const halfSpan = span / 2;
  const ridgeH = height + halfSpan * Math.tan((roofPitch * Math.PI) / 180);

  let nodeId = 1;
  let memberId = 1;

  // For each bay frame
  for (let i = 0; i <= numBays; i++) {
    const z = i * baySpacing;

    // Left column base
    const lBase = nodeId++;
    nodes.push({ id: lBase, x: 0, y: 0, z });
    // Left column top
    const lTop = nodeId++;
    nodes.push({ id: lTop, x: 0, y: height, z });
    // Ridge
    const ridge = nodeId++;
    nodes.push({ id: ridge, x: halfSpan, y: ridgeH, z });
    // Right column top
    const rTop = nodeId++;
    nodes.push({ id: rTop, x: span, y: height, z });
    // Right column base
    const rBase = nodeId++;
    nodes.push({ id: rBase, x: span, y: 0, z });

    // Left column member
    members.push({ id: memberId++, startNode: lBase, endNode: lTop, type: 'column' });
    // Left rafter
    members.push({ id: memberId++, startNode: lTop, endNode: ridge, type: 'rafter' });
    // Right rafter
    members.push({ id: memberId++, startNode: ridge, endNode: rTop, type: 'rafter' });
    // Right column member
    members.push({ id: memberId++, startNode: rTop, endNode: rBase, type: 'column' });
  }

  return { nodes, members, projectName: 'PEB Structure' };
}

export function generateStaadFile(geo: StaadGeometry): string {
  const lines: string[] = [];

  lines.push(`STAAD SPACE`);
  lines.push(`START JOB INFORMATION`);
  lines.push(`ENGINEER DATE ${new Date().toLocaleDateString()}`);
  lines.push(`JOB NAME ${geo.projectName}`);
  lines.push(`END JOB INFORMATION`);
  lines.push(`INPUT WIDTH 79`);
  lines.push(`UNIT METER KN`);
  lines.push(``);
  lines.push(`JOINT COORDINATES`);

  for (const node of geo.nodes) {
    lines.push(`${node.id} ${node.x.toFixed(3)} ${node.y.toFixed(3)} ${node.z.toFixed(3)}`);
  }

  lines.push(``);
  lines.push(`MEMBER INCIDENCES`);

  for (const member of geo.members) {
    lines.push(`${member.id} ${member.startNode} ${member.endNode}`);
  }

  lines.push(``);
  lines.push(`DEFINE MATERIAL START`);
  lines.push(`ISOTROPIC STEEL`);
  lines.push(`E 2.05e8`);
  lines.push(`POISSON 0.3`);
  lines.push(`DENSITY 76.8195`);
  lines.push(`ALPHA 1.2e-5`);
  lines.push(`DAMP 0.03`);
  lines.push(`END DEFINE MATERIAL`);
  lines.push(``);
  lines.push(`MEMBER PROPERTY AMERICAN`);
  lines.push(`${geo.members.filter(m => m.type === 'column').map(m => m.id).join(' ')} TABLE ST W14X48`);
  lines.push(`${geo.members.filter(m => m.type === 'rafter').map(m => m.id).join(' ')} TABLE ST W16X40`);
  lines.push(``);
  lines.push(`CONSTANTS`);
  lines.push(`MATERIAL STEEL ALL`);
  lines.push(``);
  lines.push(`SUPPORTS`);
  const baseNodes = geo.nodes.filter((_, i) => i % 5 === 0 || i % 5 === 4).map(n => n.id);
  lines.push(`${baseNodes.join(' ')} FIXED`);
  lines.push(``);
  lines.push(`LOAD 1 LOADTYPE Dead TITLE DEAD LOAD`);
  lines.push(`SELFWEIGHT Y -1`);
  lines.push(``);
  lines.push(`PERFORM ANALYSIS`);
  lines.push(``);
  lines.push(`FINISH`);

  return lines.join('\n');
}

export function downloadStaadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
