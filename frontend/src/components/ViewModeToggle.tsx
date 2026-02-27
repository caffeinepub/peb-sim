import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Eye, EyeOff } from "lucide-react";

interface ViewModeToggleProps {
  isWalkthrough: boolean;
  onToggle: () => void;
}

export default function ViewModeToggle({ isWalkthrough, onToggle }: ViewModeToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isWalkthrough ? "destructive" : "outline"}
            size="sm"
            onClick={onToggle}
            className="gap-1.5 text-xs"
          >
            {isWalkthrough ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Exit Tour
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Building Tour
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs max-w-48">
          {isWalkthrough
            ? "Press Escape or click to exit first-person view"
            : "Enter first-person walkthrough mode. Use WASD to move, mouse to look."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
