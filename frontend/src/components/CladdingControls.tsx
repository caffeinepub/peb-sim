import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Layers } from "lucide-react";
import type { CladdingProfile } from "./CladdingSystem";

export interface CladdingState {
  showRoofCladding: boolean;
  showWallCladding: boolean;
  skylightMode: boolean;
  profile: CladdingProfile;
  showSecondaryMembers: boolean;
}

interface CladdingControlsProps {
  state: CladdingState;
  onChange: (state: CladdingState) => void;
}

export default function CladdingControls({ state, onChange }: CladdingControlsProps) {
  const update = (partial: Partial<CladdingState>) =>
    onChange({ ...state, ...partial });

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          Cladding & Structure
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Roof Cladding</Label>
          <Switch
            checked={state.showRoofCladding}
            onCheckedChange={(v) => update({ showRoofCladding: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Wall Cladding</Label>
          <Switch
            checked={state.showWallCladding}
            onCheckedChange={(v) => update({ showWallCladding: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Skylight / Polycarbonate</Label>
          <Switch
            checked={state.skylightMode}
            onCheckedChange={(v) => update({ skylightMode: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Secondary Members</Label>
          <Switch
            checked={state.showSecondaryMembers}
            onCheckedChange={(v) => update({ showSecondaryMembers: v })}
          />
        </div>

        <div className="space-y-1.5 pt-1">
          <Label className="text-xs text-muted-foreground">Cladding Profile</Label>
          <RadioGroup
            value={state.profile}
            onValueChange={(v) => update({ profile: v as CladdingProfile })}
            className="flex gap-3"
          >
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="Trapezoidal" id="trap" />
              <Label htmlFor="trap" className="text-xs cursor-pointer">Trapezoidal</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="Standing Seam" id="seam" />
              <Label htmlFor="seam" className="text-xs cursor-pointer">Standing Seam</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
