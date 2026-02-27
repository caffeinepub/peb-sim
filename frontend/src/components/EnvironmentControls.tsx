import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Globe } from "lucide-react";
import type { GroundTexture } from "./EnvironmentScene";

interface EnvironmentControlsProps {
  groundTexture: GroundTexture;
  onChange: (texture: GroundTexture) => void;
}

export default function EnvironmentControls({
  groundTexture,
  onChange,
}: EnvironmentControlsProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          Environment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Ground Surface</Label>
          <RadioGroup
            value={groundTexture}
            onValueChange={(v) => onChange(v as GroundTexture)}
            className="flex flex-col gap-1.5"
          >
            {(["Concrete", "Asphalt", "Grass"] as GroundTexture[]).map((t) => (
              <div key={t} className="flex items-center gap-2">
                <RadioGroupItem value={t} id={`ground-${t}`} />
                <Label htmlFor={`ground-${t}`} className="text-xs cursor-pointer">
                  {t}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
