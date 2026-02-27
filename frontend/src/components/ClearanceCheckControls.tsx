import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Truck } from "lucide-react";
import type { VehiclePreset } from "./ClearanceCheckBox";

interface ClearanceCheckControlsProps {
  enabled: boolean;
  preset: VehiclePreset;
  onToggle: (enabled: boolean) => void;
  onPresetChange: (preset: VehiclePreset) => void;
}

const PRESET_DIMS: Record<VehiclePreset, string> = {
  Truck: "6.0m × 2.5m × 3.5m (L×W×H)",
  Forklift: "3.0m × 1.5m × 2.2m (L×W×H)",
};

export default function ClearanceCheckControls({
  enabled,
  preset,
  onToggle,
  onPresetChange,
}: ClearanceCheckControlsProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          Clearance Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Enable Clearance Check</Label>
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
        {enabled && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Vehicle Preset</Label>
              <RadioGroup
                value={preset}
                onValueChange={(v) => onPresetChange(v as VehiclePreset)}
                className="flex flex-col gap-1.5"
              >
                {(["Truck", "Forklift"] as VehiclePreset[]).map((p) => (
                  <div key={p} className="flex items-center gap-2">
                    <RadioGroupItem value={p} id={`vehicle-${p}`} />
                    <Label htmlFor={`vehicle-${p}`} className="text-xs cursor-pointer">
                      {p}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
              {PRESET_DIMS[preset]}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag the box inside the building to check clearance.{" "}
              <span className="text-green-500 font-semibold">Green</span> = clear,{" "}
              <span className="text-red-500 font-semibold">Red</span> = collision.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
