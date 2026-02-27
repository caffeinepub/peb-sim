import { useState, useCallback } from 'react';
import { parseDxf, generateSampleBuilding, type BuildingElement } from '../utils/dxfParser';

interface UseDxfParserResult {
  elements: BuildingElement[] | null;
  isLoading: boolean;
  error: string | null;
  parseFile: (file: File) => Promise<BuildingElement[]>;
  reset: () => void;
}

export function useDxfParser(): UseDxfParserResult {
  const [elements, setElements] = useState<BuildingElement[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFile = useCallback(async (file: File): Promise<BuildingElement[]> => {
    setIsLoading(true);
    setError(null);
    setElements(null);

    try {
      if (!file.name.toLowerCase().endsWith('.dxf')) {
        throw new Error('Invalid file type. Only .dxf files are supported.');
      }

      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 50MB.');
      }

      const text = await file.text();

      if (!text.includes('ENTITIES') && !text.includes('LINE')) {
        throw new Error('Invalid DXF file: No entities section found.');
      }

      const parsed = parseDxf(text);

      if (parsed.length === 0) {
        throw new Error(
          'No recognized building elements found. Ensure your DXF file contains layers named: COLUMN, RAFTER, PURLIN, GIRT, STRUT, or ANCHOR_BOLT.'
        );
      }

      setElements(parsed);
      return parsed;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse DXF file.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setElements(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { elements, isLoading, error, parseFile, reset };
}
