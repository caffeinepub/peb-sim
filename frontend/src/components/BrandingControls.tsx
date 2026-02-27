import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Palette, Type } from "lucide-react";
import RALColorPicker from "./RALColorPicker";
import type { RALColor } from "@/data/ralColors";

export interface BrandingState {
  signageText: string;
  showSignage: boolean;
  roofColor: RALColor;
  wallColor: RALColor;
  trimColor: RALColor;
  structureColor: RALColor;
}

interface BrandingControlsProps {
  state: BrandingState;
  onChange: (state: BrandingState) => void;
}

export default function BrandingControls({ state, onChange }: BrandingControlsProps) {
  const update = (partial: Partial<BrandingState>) =>
    onChange({ ...state, ...partial });

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          Branding & Colors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Signage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-1">
              <Type className="w-3 h-3" /> Building Signage
            </Label>
            <Switch
              checked={state.showSignage}
              onCheckedChange={(v) => update({ showSignage: v })}
            />
          </div>
          {state.showSignage && (
            <Input
              value={state.signageText}
              onChange={(e) => update({ signageText: e.target.value.slice(0, 50) })}
              placeholder="e.g. Factory A"
              className="h-8 text-xs"
              maxLength={50}
            />
          )}
        </div>

        <Separator />

        {/* RAL Color Pickers */}
        <div className="space-y-2">
          <RALColorPicker
            label="Roof Cladding"
            selectedRAL={state.roofColor}
            onChange={(c) => update({ roofColor: c })}
          />
          <RALColorPicker
            label="Wall Cladding"
            selectedRAL={state.wallColor}
            onChange={(c) => update({ wallColor: c })}
          />
          <RALColorPicker
            label="Trims"
            selectedRAL={state.trimColor}
            onChange={(c) => update({ trimColor: c })}
          />
          <RALColorPicker
            label="Structure"
            selectedRAL={state.structureColor}
            onChange={(c) => update({ structureColor: c })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
