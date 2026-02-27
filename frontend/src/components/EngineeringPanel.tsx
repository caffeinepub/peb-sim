import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Weight, Layers, ShieldCheck, AlertTriangle } from "lucide-react";
import {
  calculateBuildingStats,
  type BuildingDimensions,
  type MemberDimensions,
  type OpeningData,
  type LoadInputs,
} from "@/utils/calculateBuildingStats";
import { generateBOQItems, downloadBOQCSV } from "@/utils/generateBOQ";

interface EngineeringPanelProps {
  projectName: string;
  dims: BuildingDimensions;
  members: MemberDimensions;
  openings: OpeningData;
  loads: LoadInputs;
}

export default function EngineeringPanel({
  projectName,
  dims,
  members,
  openings,
  loads,
}: EngineeringPanelProps) {
  const stats = useMemo(
    () => calculateBuildingStats(dims, members, openings, loads),
    [dims, members, openings, loads]
  );

  const handleDownloadBOQ = () => {
    const items = generateBOQItems(dims, members, openings);
    downloadBOQCSV(projectName, items);
  };

  const isSafe = stats.designStatus === "Safe";

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Weight className="w-4 h-4 text-primary" />
          Engineering Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Steel Weight */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Weight className="w-3 h-3" /> Steel Weight
          </span>
          <span className="text-xs font-mono font-semibold">
            {stats.steelWeight.toLocaleString()} kg
          </span>
        </div>

        {/* Sheeting Area */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Layers className="w-3 h-3" /> Sheeting Area
          </span>
          <span className="text-xs font-mono font-semibold">
            {stats.sheetingArea.toLocaleString()} m²
          </span>
        </div>

        {/* Roof / Wall breakdown */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground pl-4">Roof</span>
          <span className="text-xs font-mono">{stats.roofArea} m²</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground pl-4">Walls</span>
          <span className="text-xs font-mono">{stats.wallArea} m²</span>
        </div>

        {/* Design Status */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {isSafe ? (
              <ShieldCheck className="w-3 h-3 text-green-500" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-amber-500" />
            )}
            Design Status
          </span>
          <Badge
            variant={isSafe ? "default" : "destructive"}
            className={`text-xs ${isSafe ? "bg-green-600 hover:bg-green-600" : "bg-amber-600 hover:bg-amber-600"}`}
          >
            {stats.designStatus}
          </Badge>
        </div>

        {/* Design Notes */}
        {stats.designNotes.length > 0 && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2 space-y-0.5">
            {stats.designNotes.map((note, i) => (
              <p key={i} className="leading-tight">• {note}</p>
            ))}
          </div>
        )}

        {/* Download BOQ */}
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs gap-1.5 mt-1"
          onClick={handleDownloadBOQ}
        >
          <Download className="w-3 h-3" />
          Download BOQ (CSV)
        </Button>
      </CardContent>
    </Card>
  );
}
