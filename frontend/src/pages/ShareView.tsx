import React, { useState, Suspense } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Eye, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetProjectByShareToken, useGetComments } from '@/hooks/useQueries';
import CommentSidebar from '@/components/CommentSidebar';
import BuildingSimulator from '@/components/BuildingSimulator';
import type { BuildingParams } from '@/components/BuildingSimulator';
import type { Comment } from '@/backend';

// Default cladding/accessory/branding states for read-only view
import { DEFAULT_RAL_COLORS } from '@/data/ralColors';

export default function ShareView() {
  const { token } = useParams({ from: '/share/$token' });
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useGetProjectByShareToken(token ?? null);
  const { data: comments = [] } = useGetComments(project ? project.id : null);
  const [highlightedCommentId, setHighlightedCommentId] = useState<bigint | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-amber-400 mx-auto" />
          <p className="text-slate-400">Loading shared model...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-100">Invalid Share Link</h2>
          <p className="text-slate-400">
            This share link is invalid or has expired. Please request a new link from the project owner.
          </p>
          <Button
            onClick={() => navigate({ to: '/' })}
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  // Parse erection data for building params
  let erectionData: Record<string, number> = {};
  if (project.erectionDataJSON) {
    try {
      erectionData = JSON.parse(project.erectionDataJSON);
    } catch {
      // use defaults
    }
  }

  const buildingParams: BuildingParams = {
    length: erectionData.length ?? 30,
    width: erectionData.width ?? 20,
    height: erectionData.height ?? 6,
    ridgeHeight: erectionData.ridgeHeight ?? 8,
    baySpacing: erectionData.baySpacing ?? 6,
    numBays: erectionData.numBays ?? 5,
    erectionStep: erectionData.totalSteps ?? 10,
    totalSteps: erectionData.totalSteps ?? 10,
  };

  const claddingState = {
    showRoofCladding: true,
    showWallCladding: true,
    skylightMode: false,
    profile: 'Trapezoidal' as const,
    showSecondaryMembers: true,
  };

  const accessoryState = {
    showVentilators: false,
    showGutters: false,
    showDoors: false,
    showBracing: false,
    bracedBays: [] as number[],
    numBays: buildingParams.numBays,
  };

  const brandingState = {
    signageText: project.brandingSettings.signageText || '',
    showSignage: !!project.brandingSettings.signageText,
    roofColor: DEFAULT_RAL_COLORS.roof,
    wallColor: DEFAULT_RAL_COLORS.wall,
    trimColor: DEFAULT_RAL_COLORS.trim,
    structureColor: DEFAULT_RAL_COLORS.structure,
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center gap-3 z-10 flex-shrink-0">
        <img src="/assets/generated/peb-sim-logo.dim_256x256.png" alt="PEB-Sim" className="h-8 w-8 rounded" />
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-slate-100 truncate">{project.name}</h1>
          <p className="text-xs text-slate-500">
            {buildingParams.length}m × {buildingParams.width}m × {buildingParams.height}m
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/40 rounded-full px-3 py-1">
          <Eye className="h-3 w-3 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400">View Only</span>
        </div>
      </header>

      {/* 3D Viewer */}
      <div className="flex-1 relative">
        <BuildingSimulator
          params={buildingParams}
          claddingState={claddingState}
          accessoryState={accessoryState}
          brandingState={brandingState}
          groundTexture="Concrete"
          timeOfDay={12}
          shadowStudyEnabled={false}
          isWalkthrough={false}
          clearanceEnabled={false}
          clearancePreset="Truck"
          onWalkthroughExit={() => {}}
          comments={comments}
          onCommentMarkerClick={(comment: Comment) => setHighlightedCommentId(comment.id)}
        />

        {/* Comment sidebar (read-only) */}
        <CommentSidebar
          comments={comments}
          onDelete={async () => {}}
          readOnly={true}
          highlightedCommentId={highlightedCommentId}
          onCommentClick={(comment: Comment) => setHighlightedCommentId(comment.id)}
        />
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 px-4 py-2 text-center flex-shrink-0">
        <p className="text-xs text-slate-600">
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline"
          >
            caffeine.ai
          </a>{' '}
          · © {new Date().getFullYear()} PEB-Sim
        </p>
      </footer>
    </div>
  );
}
