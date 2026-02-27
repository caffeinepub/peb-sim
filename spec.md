# Specification

## Summary
**Goal:** Extend PEB-Sim with auto-drafting (GA Drawings PDF), LOD 350 connection detail hotspots, shared read-only links, 3D sticky-note annotations, a commercial costing engine, and advanced structural exports (STAAD.Pro / IFC).

**Planned changes:**
- Add a 2D GA Drawing Generator that renders four SVG views (Anchor Bolt Plan, Cross Section, Roof Plan, Side Elevation) and packages them into a downloadable PDF via a "Download GA Drawings" button in the engineering panel
- Add LOD 350 clickable hotspot spheres (glowing amber) at Haunch, Ridge, and Base Plate joints; clicking opens a modal with a detailed SVG/Three.js connection view (anchor bolts, stiffener plates, grout gap, bolt rows)
- Render Concrete Pedestal and Foundation Block geometry beneath each column in the main 3D scene
- Add backend SharedLink data model (token, projectId, ownerPrincipal, createdAt) with `createSharedLink` and `getProjectByShareToken` endpoints persisted in the Motoko actor
- Add backend Comment data model (id, projectId, author, elementId, position xyz, text, createdAt) with `addComment`, `getComments`, and `deleteComment` endpoints persisted in the Motoko actor
- Add a `/share/:token` React route that renders the full 3D building viewer in read-only mode (all editing controls hidden, "View Only" badge shown); invalid tokens show an error message
- Add a "Share" button in ProjectViewer that calls `createSharedLink` and shows the generated URL in a copyable dialog
- Implement 3D sticky-note annotation UI: double-clicking a structural element opens a comment input popover; submitted comments appear as floating yellow billboard markers in the 3D scene; a collapsible CommentSidebar lists all annotations with author, element reference, text, and per-own-comment delete; share view shows markers/sidebar read-only
- Add a Rate Card settings panel with four numeric inputs (Primary Steel $/MT, Secondary Steel $/MT, Sheeting $/sqm, Erection Labor $/sqm) stored in local state; add a `calculateProjectCost` utility that multiplies rates against quantities from `calculateBuildingStats`; display a live "Total Project Cost" formatted currency value in the engineering sidebar
- Add an Export section with "Export STAAD.Pro (.std)" and "Export IFC (.ifc)" buttons that generate and download the respective text files encoding node coordinates, member incidences, IfcColumn, and IfcBeam entities from the current building geometry

**User-visible outcome:** Engineers can download GA drawing PDFs, inspect high-fidelity connection details, share a read-only model link with clients, leave and view 3D sticky-note annotations on structural elements, see a live commercial cost estimate that updates with building changes, and export center-line geometry to STAAD.Pro or IFC formats.
