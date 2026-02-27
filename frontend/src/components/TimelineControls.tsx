import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { ERECTION_STEP_LABELS } from '../utils/dxfParser';

interface TimelineControlsProps {
  currentStep: number;
  maxStep: number;
  isPlaying: boolean;
  onStepChange: (step: number) => void;
  onPlayPause: () => void;
}

export default function TimelineControls({
  currentStep,
  maxStep,
  isPlaying,
  onStepChange,
  onPlayPause,
}: TimelineControlsProps) {
  const stepLabel = ERECTION_STEP_LABELS[currentStep] ?? `Step ${currentStep}`;

  return (
    <div className="bg-card/90 backdrop-blur-sm border border-border rounded-sm p-4 space-y-3">
      {/* Step info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Erection Step
          </span>
          <span className="font-mono text-sm font-semibold text-amber">
            {currentStep} / {maxStep}
          </span>
        </div>
        <span className="font-mono text-sm text-foreground">
          {stepLabel}
        </span>
      </div>

      {/* Slider */}
      <Slider
        value={[currentStep]}
        min={0}
        max={maxStep}
        step={1}
        onValueChange={([val]) => onStepChange(val)}
        className="w-full"
      />

      {/* Step markers */}
      <div className="flex justify-between">
        {Array.from({ length: maxStep + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => onStepChange(i)}
            className={`
              w-2 h-2 rounded-full transition-all
              ${i <= currentStep ? 'bg-amber' : 'bg-border'}
              ${i === currentStep ? 'scale-150' : 'hover:bg-amber/50'}
            `}
            title={ERECTION_STEP_LABELS[i] ?? `Step ${i}`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onStepChange(0)}
          className="w-8 h-8 text-muted-foreground hover:text-foreground"
          title="Reset"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          onClick={onPlayPause}
          className="bg-amber text-primary-foreground hover:bg-amber-light font-mono gap-2 px-6"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Play
            </>
          )}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => onStepChange(maxStep)}
          className="w-8 h-8 text-muted-foreground hover:text-foreground"
          title="Jump to end"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
