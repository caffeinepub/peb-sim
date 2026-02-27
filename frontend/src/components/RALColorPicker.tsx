import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RAL_COLORS, type RALColor } from "@/data/ralColors";
import { Check } from "lucide-react";

interface RALColorPickerProps {
  label: string;
  selectedRAL: RALColor;
  onChange: (color: RALColor) => void;
}

export default function RALColorPicker({ label, selectedRAL, onChange }: RALColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-9 px-2"
          >
            <span
              className="w-5 h-5 rounded border border-border flex-shrink-0"
              style={{ backgroundColor: selectedRAL.hex }}
            />
            <span className="text-xs truncate">
              {selectedRAL.code} — {selectedRAL.name}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="start">
          <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Select RAL Color
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {RAL_COLORS.map((color) => (
              <button
                key={color.code}
                title={`${color.code} — ${color.name}`}
                onClick={() => {
                  onChange(color);
                  setOpen(false);
                }}
                className="relative w-10 h-10 rounded border-2 transition-all hover:scale-110"
                style={{
                  backgroundColor: color.hex,
                  borderColor: selectedRAL.code === color.code ? "#fff" : "transparent",
                }}
              >
                {selectedRAL.code === color.code && (
                  <Check
                    className="absolute inset-0 m-auto w-4 h-4"
                    style={{ color: parseInt(color.hex.slice(1), 16) > 0x888888 ? "#000" : "#fff" }}
                  />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Selected: <strong>{selectedRAL.code}</strong> — {selectedRAL.name}
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
