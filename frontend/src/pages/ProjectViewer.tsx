import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "@/hooks/useActor";
import { useGetProject } from "@/hooks/useQueries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Settings, Layers, Wrench, Palette, Calculator } from "lucide-react";
import BuildingSimulator, { type BuildingSimulatorHandle, type BuildingParams } from "@/components/BuildingSimulator";
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
import { DEFAULT_RAL_COLORS } from "@/data/ralColors";
import type { GroundTexture } from "@/components/EnvironmentScene";
import type { VehiclePreset } from "@/components/ClearanceCheckBox";
import type { LoadInputs } from "@/utils/calculateBuildingStats";
import type { Project } from "@/backend";

export default function ProjectViewer() {
  const { projectId } = useParams({ from: "/authenticated/project/$projectId" });
  const navigate = useNavigate();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const simulatorRef = useRef<BuildingSimulatorHandle>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  // Fetch project using the shared hook (properly typed as Project)
  const { data: project, isLoading } = useGetProject(BigInt(projectId));

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
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cladding" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-4 mx-2 mt-2 h-8">
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
          />
        </div>
      </div>
    </div>
  );
}
