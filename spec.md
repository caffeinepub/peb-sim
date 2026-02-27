# Specification

## Summary
**Goal:** Extend the PEB-Sim 3D building configurator with advanced visualization, secondary structural members, accessories, environment, engineering calculations, BOQ export, RAL color branding, 3D signage, first-person walkthrough, video export, shadow study, and clearance check tools.

**Planned changes:**
- Add roof and wall cladding meshes with Trapezoidal and Standing Seam texture options, plus a Skylight/Polycarbonate semi-transparent mode, each independently toggled from the UI
- Auto-generate Z-Purlin and C-Girt secondary structural members using InstancedMesh along bay grid lines with a show/hide toggle
- Add parametric 3D accessories: spinning Turbo Ventilators on the ridge, Gutters and Downspouts along eaves, snap-to-grid Rolling Shutters and Personnel Doors, and X-Bracing for walls and roof bays — each with an independent toggle
- Add a skybox with procedural sky and clouds, plus a ground plane with switchable textures (Concrete, Asphalt, Grass)
- Create a `calculateBuildingStats.ts` utility that computes steel weight estimate, sheeting area, and a simplified load simulation returning Safe or Requires Validation
- Add an Engineering / BOQ panel displaying stats from the utility, with a Download BOQ button that exports a CSV of all parts, quantities, dimensions, and weights
- Extend the Motoko backend project record to store `brandingSettings` (signageText, RAL colors for roof/wall/trim/structure) and `engineeringInputs` (windSpeed, seismicZone, liveLoad) with update and query methods
- Add a `BuildingSignage` component rendering user-typed text as extruded 3D geometry centered on the front fascia, colored by Trim RAL selection, toggleable
- Add a RAL Color Picker panel with four independent pickers (Roof, Wall Cladding, Trims, Structure) showing at least 20 RAL swatches that immediately update 3D materials and persist to the backend
- Create a `WalkthroughController.tsx` using PointerLockControls for first-person WASD + mouse-look interior view with basic collision detection, toggled against OrbitControls exterior view
- Add a client-side video export button that records the Three.js canvas during full erection sequence playback using MediaRecorder (high-bitrate VP9/VP8) and downloads a WebM file
- Add a Shadow Study Time of Day slider (6:00–20:00) that repositions a DirectionalLight to simulate sun angle and cast real-time shadows on the ground and interior surfaces
- Add a Clearance Check tool with a draggable 3D box (Truck or Forklift preset) on the floor plane that turns red on structural member intersection and green when clear

**User-visible outcome:** Users can visualize a fully clad PEB building with secondary members, accessories, environment, and branding; run engineering calculations and download a BOQ CSV; walk through the building in first person; export an animation video; study shadow/skylight planning; and verify vehicle clearance — all within the browser.
