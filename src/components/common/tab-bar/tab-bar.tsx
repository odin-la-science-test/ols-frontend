'use client';

import { TabBarInner } from './tab-bar-inner';
import { StandaloneTabBar } from './standalone-tab-bar';
import type { TabBarProps } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// TAB BAR - Professional tab system with cross-group drag & drop
//
// When rendered inside a <TabDndProvider> (split mode), the DndContext
// is provided externally → tabs can be dragged across editor groups.
//
// When rendered standalone (no split), an internal DndContext is used
// for within-group reordering.
// ═══════════════════════════════════════════════════════════════════════════

export function TabBar({ className, editorGroupId, externalDnd }: TabBarProps) {
  // When using external DnD, just render the inner content directly
  if (externalDnd) {
    return <TabBarInner className={className} editorGroupId={editorGroupId} externalDnd />;
  }

  // Standalone mode — provide our own DndContext
  return <StandaloneTabBar className={className} editorGroupId={editorGroupId} />;
}
