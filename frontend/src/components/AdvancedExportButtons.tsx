import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { buildGeometryFromState, generateStaadFile, downloadStaadFile } from '@/utils/staadExporter';
import { buildIfcMembersFromState, generateIfcFile, downloadIfcFile } from '@/utils/ifcExporter';
import type { BuildingState } from '@/utils/gaDrawingGenerator';

interface AdvancedExportButtonsProps {
  buildingState: BuildingState;
  projectName?: string;
}

export default function AdvancedExportButtons({ buildingState, projectName = 'Project' }: AdvancedExportButtonsProps) {
  const [staadLoading, setStaadLoading] = useState(false);
  const [ifcLoading, setIfcLoading] = useState(false);

  const handleStaadExport = async () => {
    setStaadLoading(true);
    try {
      const geo = buildGeometryFromState(
        buildingState.span,
        buildingState.length,
        buildingState.height,
        buildingState.baySpacing,
        buildingState.roofPitch
      );
      geo.projectName = projectName;
      const content = generateStaadFile(geo);
      downloadStaadFile(content, `${projectName.replace(/\s+/g, '_')}.std`);
      toast.success('STAAD.Pro file exported!');
    } catch (err) {
      toast.error('Failed to export STAAD.Pro file.');
    } finally {
      setStaadLoading(false);
    }
  };

  const handleIfcExport = async () => {
    setIfcLoading(true);
    try {
      const members = buildIfcMembersFromState(
        buildingState.span,
        buildingState.length,
        buildingState.height,
        buildingState.baySpacing,
        buildingState.roofPitch
      );
      const content = generateIfcFile(members, projectName);
      downloadIfcFile(content, `${projectName.replace(/\s+/g, '_')}.ifc`);
      toast.success('IFC file exported!');
    } catch (err) {
      toast.error('Failed to export IFC file.');
    } finally {
      setIfcLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleStaadExport}
        disabled={staadLoading}
        className="w-full gap-2 border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
      >
        {staadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {staadLoading ? 'Exporting...' : 'Export STAAD.Pro (.std)'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleIfcExport}
        disabled={ifcLoading}
        className="w-full gap-2 border-green-500/40 text-green-400 hover:bg-green-500/10"
      >
        {ifcLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {ifcLoading ? 'Exporting...' : 'Export IFC (.ifc)'}
      </Button>
    </div>
  );
}
