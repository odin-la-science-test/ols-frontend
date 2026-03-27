// Re-export from refactored sidebar module — keeps all existing import paths working.
export type { UnifiedSidebarContextValue, PanelRenderer, UnifiedSidebarContentProps } from './sidebar';
export {
  useUnifiedSidebarContext,
  registerPanelRenderer,
  getPanelRenderer,
  useSidebarDndOverlay,
  SidebarEdgeDropZones,
  UnifiedSidebarContent,
} from './sidebar';
