'use client';

import { createContext, useContext } from 'react';

import type { UnifiedSidebarContextValue, PanelRenderer } from './types';

// ─── Context ─────────────────────────────────────────────────────────────

const UnifiedSidebarContext = createContext<UnifiedSidebarContextValue | null>(null);

export { UnifiedSidebarContext };

export function useUnifiedSidebarContext() {
  return useContext(UnifiedSidebarContext);
}

// ─── Panel Renderers Registry ────────────────────────────────────────────

const panelRenderers = new Map<string, PanelRenderer>();

export function registerPanelRenderer(panelId: string, renderer: PanelRenderer) {
  panelRenderers.set(panelId, renderer);
}

export function getPanelRenderer(panelId: string): PanelRenderer | undefined {
  return panelRenderers.get(panelId);
}
