// IFC 2x3 file exporter

export interface IfcNode {
  x: number;
  y: number;
  z: number;
}

export interface IfcMember {
  type: 'column' | 'beam';
  start: IfcNode;
  end: IfcNode;
  label: string;
}

let entityCounter = 100;
function nextId(): number {
  return entityCounter++;
}

function resetCounter(): void {
  entityCounter = 100;
}

function ifcPoint(x: number, y: number, z: number): { id: number; line: string } {
  const id = nextId();
  return { id, line: `#${id}= IFCCARTESIANPOINT((${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}));` };
}

function ifcDirection(dx: number, dy: number, dz: number): { id: number; line: string } {
  const id = nextId();
  return { id, line: `#${id}= IFCDIRECTION((${dx.toFixed(6)},${dy.toFixed(6)},${dz.toFixed(6)}));` };
}

export function generateIfcFile(members: IfcMember[], projectName: string): string {
  resetCounter();
  const lines: string[] = [];
  const entityLines: string[] = [];

  // Header
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  lines.push(`ISO-10303-21;`);
  lines.push(`HEADER;`);
  lines.push(`FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');`);
  lines.push(`FILE_NAME('${projectName}.ifc','${now}',('PEB-Sim'),('PEB-Sim'),'IFC2X3','PEB-Sim Exporter','');`);
  lines.push(`FILE_SCHEMA(('IFC2X3'));`);
  lines.push(`ENDSEC;`);
  lines.push(`DATA;`);

  // Project context
  const projId = nextId();
  entityLines.push(`#${projId}= IFCPROJECT('${generateGuid()}',#${nextId()},'${projectName}',$,$,$,$,(#${nextId()}),#${nextId()});`);

  // Units
  const unitAssignId = nextId();
  entityLines.push(`#${unitAssignId}= IFCUNITASSIGNMENT((#${nextId()},#${nextId()},#${nextId()}));`);

  // Members
  for (const member of members) {
    const sp = ifcPoint(member.start.x, member.start.y, member.start.z);
    const ep = ifcPoint(member.end.x, member.end.y, member.end.z);

    const dx = member.end.x - member.start.x;
    const dy = member.end.y - member.start.y;
    const dz = member.end.z - member.start.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    const dir = ifcDirection(dx / len, dy / len, dz / len);

    entityLines.push(sp.line);
    entityLines.push(ep.line);
    entityLines.push(dir.line);

    const axisId = nextId();
    entityLines.push(`#${axisId}= IFCAXIS2PLACEMENT3D(#${sp.id},$,#${dir.id});`);

    const repItemId = nextId();
    entityLines.push(`#${repItemId}= IFCPOLYLINE((#${sp.id},#${ep.id}));`);

    const repId = nextId();
    entityLines.push(`#${repId}= IFCSHAPEREPRESENTATION($,'Axis','Curve3D',(#${repItemId}));`);

    const prodRepId = nextId();
    entityLines.push(`#${prodRepId}= IFCPRODUCTDEFINITIONSHAPE($,$,(#${repId}));`);

    const placementId = nextId();
    entityLines.push(`#${placementId}= IFCLOCALPLACEMENT($,#${axisId});`);

    const elemId = nextId();
    const guid = generateGuid();
    if (member.type === 'column') {
      entityLines.push(`#${elemId}= IFCCOLUMN('${guid}',$,'${member.label}',$,$,#${placementId},#${prodRepId},$);`);
    } else {
      entityLines.push(`#${elemId}= IFCBEAM('${guid}',$,'${member.label}',$,$,#${placementId},#${prodRepId},$);`);
    }
  }

  lines.push(...entityLines);
  lines.push(`ENDSEC;`);
  lines.push(`END-ISO-10303-21;`);

  return lines.join('\n');
}

function generateGuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function buildIfcMembersFromState(
  span: number,
  length: number,
  height: number,
  baySpacing: number,
  roofPitch: number
): IfcMember[] {
  const members: IfcMember[] = [];
  const numBays = Math.max(1, Math.round(length / baySpacing));
  const halfSpan = span / 2;
  const ridgeH = height + halfSpan * Math.tan((roofPitch * Math.PI) / 180);

  for (let i = 0; i <= numBays; i++) {
    const z = i * baySpacing;
    // Left column
    members.push({
      type: 'column',
      start: { x: 0, y: 0, z },
      end: { x: 0, y: height, z },
      label: `COL-L-${i + 1}`,
    });
    // Right column
    members.push({
      type: 'column',
      start: { x: span, y: 0, z },
      end: { x: span, y: height, z },
      label: `COL-R-${i + 1}`,
    });
    // Left rafter
    members.push({
      type: 'beam',
      start: { x: 0, y: height, z },
      end: { x: halfSpan, y: ridgeH, z },
      label: `RAF-L-${i + 1}`,
    });
    // Right rafter
    members.push({
      type: 'beam',
      start: { x: halfSpan, y: ridgeH, z },
      end: { x: span, y: height, z },
      label: `RAF-R-${i + 1}`,
    });
  }

  return members;
}

export function downloadIfcFile(content: string, filename: string): void {
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
