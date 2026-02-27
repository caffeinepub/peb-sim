import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  generateAnchorBoltPlan,
  generateCrossSection,
  generateRoofPlan,
  generateSideElevation,
  type BuildingState,
} from '@/utils/gaDrawingGenerator';
import { generateGAPdf } from '@/utils/svgToPdf';

interface GADrawingsExportButtonProps {
  buildingState: BuildingState;
  projectName?: string;
}

export default function GADrawingsExportButton({ buildingState, projectName = 'Project' }: GADrawingsExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      const pages = [
        { title: 'Anchor Bolt Plan', svgString: generateAnchorBoltPlan(buildingState) },
        { title: 'Cross Section', svgString: generateCrossSection(buildingState) },
        { title: 'Roof Plan', svgString: generateRoofPlan(buildingState) },
        { title: 'Side Elevation', svgString: generateSideElevation(buildingState) },
      ];
      await generateGAPdf(pages, projectName);
      toast.success('GA Drawings exported successfully!');
    } catch (err) {
      console.error('GA export error:', err);
      toast.error('Failed to generate GA Drawings. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isGenerating}
      className="w-full gap-2 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {isGenerating ? 'Generating...' : 'Download GA Drawings'}
    </Button>
  );
}
