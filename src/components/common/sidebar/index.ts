// Sidebar barrel — re-exports all public API from the sidebar module

export type { UnifiedSidebarContextValue, PanelRenderer, UnifiedSidebarContentProps } from './types';
export { UnifiedSidebarContext, useUnifiedSidebarContext, registerPanelRenderer, getPanelRenderer } from './sidebar-context';
export { useSidebarDndOverlay } from './sidebar-dnd-overlay';
export { SidebarEdgeDropZones } from './sidebar-edge-drop-zones';
export { UnifiedSidebarContent } from './sidebar-content';
export { OverlayDragProvider, useOverlayDragControls } from './overlay-drag-context';
