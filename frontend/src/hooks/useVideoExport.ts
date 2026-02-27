import { useRef, useState, useCallback } from "react";

export interface UseVideoExportOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onComplete?: () => void;
}

export function useVideoExport({ canvasRef, onComplete }: UseVideoExportOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setError("Canvas not available for recording");
      return false;
    }

    try {
      const stream = canvas.captureStream(30); // 30 fps
      chunksRef.current = [];

      // Try VP9 first, fallback to VP8, then default
      const mimeTypes = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];

      let selectedMimeType = "video/webm";
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 10_000_000, // 10 Mbps
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: selectedMimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        link.href = url;
        link.download = `PEB-Sim-Export-${timestamp}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsRecording(false);
        onComplete?.();
      };

      mediaRecorder.onerror = () => {
        setError("Recording failed");
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // collect data every 100ms
      setIsRecording(true);
      setError(null);
      return true;
    } catch (err) {
      setError("Failed to start recording: " + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }, [canvasRef, onComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return { isRecording, startRecording, stopRecording, error };
}
