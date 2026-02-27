import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wind } from "lucide-react";
import type { LoadInputs } from "@/utils/calculateBuildingStats";

interface EngineeringInputsFormProps {
  inputs: LoadInputs;
  onChange: (inputs: LoadInputs) => void;
}

export default function EngineeringInputsForm({
  inputs,
  onChange,
}: EngineeringInputsFormProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Wind className="w-4 h-4 text-primary" />
          Load Inputs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Wind Speed (km/h)</Label>
          <Input
            type="number"
            min={0}
            max={300}
            value={inputs.windSpeed}
            onChange={(e) =>
              onChange({ ...inputs, windSpeed: Number(e.target.value) })
            }
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Seismic Zone</Label>
          <Select
            value={inputs.seismicZone}
            onValueChange={(v) => onChange({ ...inputs, seismicZone: v })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["I", "II", "III", "IV", "V"].map((zone) => (
                <SelectItem key={zone} value={zone} className="text-xs">
                  Zone {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Live Load (kN/m²)</Label>
          <Input
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={inputs.liveLoad}
            onChange={(e) =>
              onChange({ ...inputs, liveLoad: Number(e.target.value) })
            }
            className="h-8 text-xs"
          />
        </div>
      </CardContent>
    </Card>
  );
}
