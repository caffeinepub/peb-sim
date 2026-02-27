import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Video, Circle } from "lucide-react";
import { useVideoExport } from "@/hooks/useVideoExport";
import { toast } from "sonner";

interface VideoExportButtonProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onStartAnimation: (onComplete: () => void) => void;
}

export default function VideoExportButton({
  canvasRef,
  onStartAnimation,
}: VideoExportButtonProps) {
  const { isRecording, startRecording, stopRecording, error } = useVideoExport({
    canvasRef,
    onComplete: () => {
      toast.success("Video exported successfully!");
    },
  });

  const handleExport = useCallback(() => {
    if (isRecording) return;

    const started = startRecording();
    if (!started) {
      toast.error(error || "Failed to start recording");
      return;
    }

    toast.info("Recording started — playing erection sequence...");

    onStartAnimation(() => {
      setTimeout(() => {
        stopRecording();
      }, 500);
    });
  }, [isRecording, startRecording, stopRecording, error, onStartAnimation]);

  return (
    <Button
      variant={isRecording ? "destructive" : "outline"}
      size="sm"
      onClick={handleExport}
      disabled={isRecording}
      className="gap-1.5 text-xs"
    >
      {isRecording ? (
        <>
          <Circle className="w-3 h-3 fill-current animate-pulse" />
          Recording...
        </>
      ) : (
        <>
          <Video className="w-3.5 h-3.5" />
          Export Video
        </>
      )}
    </Button>
  );
}
