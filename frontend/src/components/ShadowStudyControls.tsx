import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Sun } from "lucide-react";

interface ShadowStudyControlsProps {
  timeOfDay: number;
  enabled: boolean;
  onTimeChange: (time: number) => void;
  onToggle: (enabled: boolean) => void;
}

function formatTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function ShadowStudyControls({
  timeOfDay,
  enabled,
  onTimeChange,
  onToggle,
}: ShadowStudyControlsProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Sun className="w-4 h-4 text-primary" />
          Shadow Study
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Enable Shadow Study</Label>
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
        {enabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Time of Day</Label>
              <span className="text-xs font-mono font-semibold text-primary">
                {formatTime(timeOfDay)}
              </span>
            </div>
            <Slider
              min={6}
              max={20}
              step={0.5}
              value={[timeOfDay]}
              onValueChange={([v]) => onTimeChange(v)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>06:00</span>
              <span>12:00</span>
              <span>20:00</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
