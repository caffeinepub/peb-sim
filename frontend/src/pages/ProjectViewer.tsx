import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "@/hooks/useActor";
import {
  useGetProject,
  useGetComments,
  useAddComment,
  useDeleteComment,
  useCreateSharedLink,
} from "@/hooks/useQueries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Settings,
  Layers,
  Wrench,
  Palette,
  Calculator,
  DollarSign,
  Download,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import BuildingSimulator, {
  type BuildingSimulatorHandle,
  type BuildingParams,
} from "@/components/BuildingSimulator";
import CladdingControls, { type CladdingState } from "@/components/CladdingControls";
import AccessoryControls, { type AccessoryState } from "@/components/AccessoryControls";
import BrandingControls, { type BrandingState } from "@/components/BrandingControls";
import EnvironmentControls from "@/components/EnvironmentControls";
import ShadowStudyControls from "@/components/ShadowStudyControls";
import ClearanceCheckControls from "@/components/ClearanceCheckControls";
import EngineeringPanel from "@/components/EngineeringPanel";
import EngineeringInputsForm from "@/components/EngineeringInputsForm";
import ViewModeToggle from "@/components/ViewModeToggle";
import VideoExportButton from "@/components/VideoExportButton";
import GADrawingsExportButton from "@/components/GADrawingsExportButton";
import AdvancedExportButtons from "@/components/AdvancedExportButtons";
import RateCardPanel from "@/components/RateCardPanel";
import ShareButton from "@/components/ShareButton";
import CommentSidebar from "@/components/CommentSidebar";
import CommentInputPopover from "@/components/CommentInputPopover";
import ConnectionDetailModal from "@/components/ConnectionDetailModal";
import { DEFAULT_RAL_COLORS } from "@/data/ralColors";
import type { GroundTexture } from "@/components/EnvironmentScene";
import type { VehiclePreset } from "@/components/ClearanceCheckBox";
import type { LoadInputs } from "@/utils/calculateBuildingStats";
import type { Project } from "@/backend";
import type { RateCard } from "@/utils/calculateProjectCost";
import { calculateProjectCost } from "@/utils/calculateProjectCost";
import { formatCurrency } from "@/utils/calculateProjectCost";
import type { BuildingState } from "@/utils/gaDrawingGenerator";
import type { ConnectionType, HotspotData } from "@/components/ConnectionHotspots";

const DEFAULT_RATES: RateCard = {
  primarySteel: 1200,
  secondarySteel: 1000,
  sheeting: 25,
  erectionLabor: 15,
};

interface CommentPopoverState {
  visible: boolean;
  screenX: number;
  screenY: number;
  worldPosition: { x: number; y: number; z: number };
  elementId: string;
}

export default function ProjectViewer() {
  const { projectId } = useParams({ from: "/project/$projectId" });
  const navigate = useNavigate();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const simulatorRef = useRef<BuildingSimulatorHandle>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const projectIdBigInt = BigInt(projectId);

  // Erection step state
  const [erectionStep, setErectionStep] = useState(0);

  // View mode
  const [isWalkthrough, setIsWalkthrough] = useState(false);

  // Cladding state
  const [claddingState, setCladdingState] = useState<CladdingState>({
    showRoofCladding: false,
    showWallCladding: false,
    skylightMode: false,
    profile: "Trapezoidal",
    showSecondaryMembers: false,
  });

  // Accessory state
  const [accessoryState, setAccessoryState] = useState<AccessoryState>({
    showVentilators: false,
    showGutters: false,
    showDoors: false,
    showBracing: false,
    bracedBays: [],
    numBays: 4,
  });

  // Branding state
  const [brandingState, setBrandingState] = useState<BrandingState>({
    signageText: "",
    showSignage: false,
    roofColor: DEFAULT_RAL_COLORS.roof,
    wallColor: DEFAULT_RAL_COLORS.wall,
    trimColor: DEFAULT_RAL_COLORS.trim,
    structureColor: DEFAULT_RAL_COLORS.structure,
  });

  // Environment state
  const [groundTexture, setGroundTexture] = useState<GroundTexture>("Concrete");
  const [timeOfDay, setTimeOfDay] = useState(12);
  const [shadowStudyEnabled, setShadowStudyEnabled] = useState(false);

  // Clearance check state
  const [clearanceEnabled, setClearanceEnabled] = useState(false);
  const [clearancePreset, setClearancePreset] = useState<VehiclePreset>("Truck");

  // Engineering inputs
  const [loadInputs, setLoadInputs] = useState<LoadInputs>({
    windSpeed: 100,
    seismicZone: "II",
    liveLoad: 1.0,
  });

  // Rate card state
  const [rates, setRates] = useState<RateCard>(DEFAULT_RATES);

  // Connection detail modal
  const [connectionModal, setConnectionModal] = useState<{
    open: boolean;
    type: ConnectionType | null;
  }>({ open: false, type: null });

  // Comment popover state
  const [commentPopover, setCommentPopover] = useState<CommentPopoverState>({
    visible: false,
    screenX: 0,
    screenY: 0,
    worldPosition: { x: 0, y: 0, z: 0 },
    elementId: "",
  });

  // Highlighted comment
  const [highlightedCommentId, setHighlightedCommentId] = useState<bigint | null>(null);

  // Fetch project
  const { data: project, isLoading } = useGetProject(projectIdBigInt);

  // Fetch comments
  const { data: comments = [] } = useGetComments(projectIdBigInt);

  // Comment mutations
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  // Initialise local state from backend data once loaded
  useEffect(() => {
    if (!project) return;
    setBrandingState((prev) => ({
      ...prev,
      signageText: project.brandingSettings.signageText || "",
    }));
    setLoadInputs({
      windSpeed: Number(project.engineeringInputs.windSpeed),
      seismicZone: project.engineeringInputs.seismicZone || "II",
      liveLoad: Number(project.engineeringInputs.liveLoad) / 10,
    });
  }, [project?.id?.toString()]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save branding mutation
  const saveBrandingMutation = useMutation({
    mutationFn: async (settings: BrandingState) => {
      if (!actor || !project) return;
      await actor.updateBrandingSettings(project.id, {
        signageText: settings.signageText,
        primaryColorRal: settings.roofColor.code,
        secondaryColorRal: settings.wallColor.code,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });

  // Save engineering inputs mutation
  const saveEngineeringMutation = useMutation({
    mutationFn: async (inputs: LoadInputs) => {
      if (!actor || !project) return;
      await actor.updateEngineeringInputs(project.id, {
        windSpeed: BigInt(Math.round(inputs.windSpeed)),
        seismicZone: inputs.seismicZone,
        liveLoad: BigInt(Math.round(inputs.liveLoad * 10)),
      });
    },
  });

  // Parse erection data
  const erectionData = project?.erectionDataJSON
    ? (() => {
        try {
          return JSON.parse(project.erectionDataJSON);
        } catch {
          return null;
        }
      })()
    : null;

  const buildingParams: BuildingParams = {
    length: erectionData?.length ?? 30,
    width: erectionData?.width ?? 20,
    height: erectionData?.height ?? 6,
    ridgeHeight: erectionData?.ridgeHeight ?? 8,
    baySpacing: erectionData?.baySpacing ?? 6,
    numBays: erectionData?.numBays ?? 5,
    erectionStep,
    totalSteps: erectionData?.totalSteps ?? 10,
  };

  const numBays = buildingParams.numBays;

  // Member dimensions for engineering calc
  const memberDimensions = {
    columnWidth: 0.25,
    columnDepth: 0.3,
    columnHeight: buildingParams.height,
    columnCount: (buildingParams.numBays + 1) * 2,
    rafterWidth: 0.2,
    rafterDepth: 0.25,
    rafterLength: Math.sqrt(
      Math.pow(buildingParams.width / 2, 2) +
        Math.pow(buildingParams.ridgeHeight - buildingParams.height, 2)
    ),
    rafterCount: (buildingParams.numBays + 1) * 2,
  };

  const openingData = {
    doorCount: accessoryState.showDoors ? 1 : 0,
    doorWidth: 1.2,
    doorHeight: 2.1,
    shutterCount: accessoryState.showDoors ? 1 : 0,
    shutterWidth: 4.0,
    shutterHeight: 4.0,
  };

  // Building state for GA drawings / exports
  const buildingState: BuildingState = {
    span: buildingParams.width,
    length: buildingParams.length,
    height: buildingParams.height,
    baySpacing: buildingParams.baySpacing,
    numBays: buildingParams.numBays,
    roofPitch: Math.atan2(
      buildingParams.ridgeHeight - buildingParams.height,
      buildingParams.width / 2
    ) * (180 / Math.PI),
    purlinSpacing: 1.5,
  };

  // Cost calculation
  const halfSpan = buildingParams.width / 2;
  const ridgeH = buildingParams.ridgeHeight;
  const rafterLen = Math.sqrt(halfSpan * halfSpan + (ridgeH - buildingParams.height) ** 2);
  const sheetingArea = 2 * rafterLen * buildingParams.length;
  const floorArea = buildingParams.width * buildingParams.length;
  const primarySteelWeight = memberDimensions.columnCount * buildingParams.height * 0.048 * 1.1 / 1000;
  const secondarySteelWeight = memberDimensions.rafterCount * rafterLen * 0.04 * 1.1 / 1000;
  const costBreakdown = calculateProjectCost(rates, {
    primarySteelWeight,
    secondarySteelWeight,
    sheetingArea,
    floorArea,
  });

  const handleStartAnimation = useCallback((onComplete: () => void) => {
    setErectionStep(0);
    simulatorRef.current?.playFullSequence(onComplete);
  }, []);

  const handleBrandingChange = (state: BrandingState) => {
    setBrandingState(state);
    saveBrandingMutation.mutate(state);
  };

  const handleLoadInputsChange = (inputs: LoadInputs) => {
    setLoadInputs(inputs);
    saveEngineeringMutation.mutate(inputs);
  };

  const handleAccessoryChange = (state: AccessoryState) => {
    setAccessoryState({ ...state, numBays });
  };

  const handleHotspotClick = useCallback((hotspot: HotspotData) => {
    setConnectionModal({ open: true, type: hotspot.type });
  }, []);

  const handleCommentSubmit = async (text: string) => {
    await addComment.mutateAsync({
      projectId: projectIdBigInt,
      elementId: commentPopover.elementId,
      position: commentPopover.worldPosition,
      text,
    });
    setCommentPopover((prev) => ({ ...prev, visible: false }));
    toast.success("Annotation added!");
  };

  const handleDeleteComment = async (commentId: bigint) => {
    await deleteComment.mutateAsync({ commentId, projectId: projectIdBigInt });
    toast.success("Annotation deleted.");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <Skeleton className="w-64 h-8" />
      </div>
    );
  }

  const projectName = (project as Project | undefined)?.name ?? "Project";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left sidebar controls */}
      <div className="w-72 flex-shrink-0 border-r border-border flex flex-col bg-card">
        {/* Header */}
        <div className="flex items-center gap-2 p-3 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => navigate({ to: "/" })}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{projectName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {buildingParams.length}m × {buildingParams.width}m × {buildingParams.height}m
            </p>
          </div>
          <ShareButton projectId={projectIdBigInt} projectName={projectName} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cladding" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-5 mx-2 mt-2 h-8">
            <TabsTrigger value="cladding" className="text-xs px-1" title="Cladding & Environment">
              <Layers className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="accessories" className="text-xs px-1" title="Accessories">
              <Wrench className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="branding" className="text-xs px-1" title="Branding & Colors">
              <Palette className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="engineering" className="text-xs px-1" title="Engineering">
              <Calculator className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="cost" className="text-xs px-1" title="Cost & Export">
              <DollarSign className="w-3 h-3" />
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              <TabsContent value="cladding" className="mt-0 space-y-2">
                <CladdingControls state={claddingState} onChange={setCladdingState} />
                <EnvironmentControls groundTexture={groundTexture} onChange={setGroundTexture} />
                <ShadowStudyControls
                  timeOfDay={timeOfDay}
                  enabled={shadowStudyEnabled}
                  onTimeChange={setTimeOfDay}
                  onToggle={setShadowStudyEnabled}
                />
              </TabsContent>

              <TabsContent value="accessories" className="mt-0 space-y-2">
                <AccessoryControls
                  state={{ ...accessoryState, numBays }}
                  onChange={handleAccessoryChange}
                />
                <ClearanceCheckControls
                  enabled={clearanceEnabled}
                  preset={clearancePreset}
                  onToggle={setClearanceEnabled}
                  onPresetChange={setClearancePreset}
                />
              </TabsContent>

              <TabsContent value="branding" className="mt-0 space-y-2">
                <BrandingControls state={brandingState} onChange={handleBrandingChange} />
              </TabsContent>

              <TabsContent value="engineering" className="mt-0 space-y-2">
                <EngineeringInputsForm
                  inputs={loadInputs}
                  onChange={handleLoadInputsChange}
                />
                <EngineeringPanel
                  projectName={projectName}
                  dims={buildingParams}
                  members={memberDimensions}
                  openings={openingData}
                  loads={loadInputs}
                />
              </TabsContent>

              <TabsContent value="cost" className="mt-0 space-y-3">
                {/* Rate Card */}
                <div className="bg-card border border-border rounded-lg p-3">
                  <RateCardPanel rates={rates} onChange={setRates} />
                </div>

                {/* Total Cost Display */}
                <div className="bg-card border border-amber-500/30 rounded-lg p-3 space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Total Project Cost
                  </p>
                  <p className="text-2xl font-mono font-bold text-amber-400">
                    {costBreakdown.formattedTotal}
                  </p>
                  <div className="space-y-1 pt-1 border-t border-border">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Primary Steel</span>
                      <span className="font-mono">{formatCurrency(costBreakdown.primarySteelCost)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Secondary Steel</span>
                      <span className="font-mono">{formatCurrency(costBreakdown.secondarySteelCost)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Sheeting</span>
                      <span className="font-mono">{formatCurrency(costBreakdown.sheetingCost)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Erection Labor</span>
                      <span className="font-mono">{formatCurrency(costBreakdown.erectionCost)}</span>
                    </div>
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="bg-card border border-border rounded-lg p-3 space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Download className="w-3 h-3" /> Exports
                  </p>
                  <GADrawingsExportButton
                    buildingState={buildingState}
                    projectName={projectName}
                  />
                  <Separator className="bg-border" />
                  <AdvancedExportButtons
                    buildingState={buildingState}
                    projectName={projectName}
                  />
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Main 3D viewport */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 flex-1">
            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Step {erectionStep} / {buildingParams.totalSteps}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => setErectionStep(Math.max(0, erectionStep - 1))}
              disabled={erectionStep <= 0}
            >
              ‹ Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() =>
                setErectionStep(Math.min(buildingParams.totalSteps, erectionStep + 1))
              }
              disabled={erectionStep >= buildingParams.totalSteps}
            >
              Next ›
            </Button>

            <div className="w-px h-5 bg-border" />

            <ViewModeToggle
              isWalkthrough={isWalkthrough}
              onToggle={() => setIsWalkthrough((v) => !v)}
            />

            <VideoExportButton
              canvasRef={canvasRef}
              onStartAnimation={handleStartAnimation}
            />
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <BuildingSimulator
            ref={simulatorRef}
            params={buildingParams}
            claddingState={claddingState}
            accessoryState={{ ...accessoryState, numBays }}
            brandingState={brandingState}
            groundTexture={groundTexture}
            timeOfDay={timeOfDay}
            shadowStudyEnabled={shadowStudyEnabled}
            isWalkthrough={isWalkthrough}
            clearanceEnabled={clearanceEnabled}
            clearancePreset={clearancePreset}
            onWalkthroughExit={() => setIsWalkthrough(false)}
            onErectionStepChange={setErectionStep}
            onHotspotClick={handleHotspotClick}
            comments={comments}
            onCommentMarkerClick={(comment) => setHighlightedCommentId(comment.id)}
            onDoubleClickElement={(elementId, worldPos, screenPos) => {
              setCommentPopover({
                visible: true,
                screenX: screenPos.x,
                screenY: screenPos.y,
                worldPosition: worldPos,
                elementId,
              });
            }}
          />

          {/* Comment input popover */}
          {commentPopover.visible && (
            <CommentInputPopover
              screenPosition={{ x: commentPopover.screenX, y: commentPopover.screenY }}
              elementId={commentPopover.elementId}
              onSubmit={handleCommentSubmit}
              onCancel={() => setCommentPopover((prev) => ({ ...prev, visible: false }))}
            />
          )}
        </div>
      </div>

      {/* Comment sidebar */}
      <CommentSidebar
        comments={comments}
        onDelete={handleDeleteComment}
        readOnly={false}
        highlightedCommentId={highlightedCommentId}
        onCommentClick={(comment) => setHighlightedCommentId(comment.id)}
      />

      {/* Connection detail modal */}
      <ConnectionDetailModal
        open={connectionModal.open}
        connectionType={connectionModal.type}
        onClose={() => setConnectionModal({ open: false, type: null })}
      />
    </div>
  );
}
