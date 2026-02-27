import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Wrench } from "lucide-react";

export interface AccessoryState {
  showVentilators: boolean;
  showGutters: boolean;
  showDoors: boolean;
  showBracing: boolean;
  bracedBays: number[];
  numBays: number;
}

interface AccessoryControlsProps {
  state: AccessoryState;
  onChange: (state: AccessoryState) => void;
}

export default function AccessoryControls({ state, onChange }: AccessoryControlsProps) {
  const update = (partial: Partial<AccessoryState>) =>
    onChange({ ...state, ...partial });

  const toggleBracedBay = (bayIndex: number) => {
    const current = state.bracedBays;
    const updated = current.includes(bayIndex)
      ? current.filter((b) => b !== bayIndex)
      : [...current, bayIndex];
    update({ bracedBays: updated });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Wrench className="w-4 h-4 text-primary" />
          Accessories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Turbo Ventilators</Label>
          <Switch
            checked={state.showVentilators}
            onCheckedChange={(v) => update({ showVentilators: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Gutters & Downspouts</Label>
          <Switch
            checked={state.showGutters}
            onCheckedChange={(v) => update({ showGutters: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Doors & Shutters</Label>
          <Switch
            checked={state.showDoors}
            onCheckedChange={(v) => update({ showDoors: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">X-Bracing</Label>
          <Switch
            checked={state.showBracing}
            onCheckedChange={(v) => update({ showBracing: v })}
          />
        </div>

        {state.showBracing && state.numBays > 0 && (
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs text-muted-foreground">Braced Bays</Label>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: state.numBays }).map((_, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Checkbox
                    id={`bay-${i}`}
                    checked={state.bracedBays.includes(i)}
                    onCheckedChange={() => toggleBracedBay(i)}
                  />
                  <Label htmlFor={`bay-${i}`} className="text-xs cursor-pointer">
                    Bay {i + 1}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
