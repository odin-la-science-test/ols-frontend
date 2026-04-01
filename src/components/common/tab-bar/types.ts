import type { MouseEvent as ReactMouseEvent } from 'react';

import type { Tab } from '@/stores';

// ─── Tab size mode ──────────────────────────────────────────────────────

export type TabSizeMode = 'full' | 'shrunk' | 'mini' | 'icon-only';

// ─── Component props ────────────────────────────────────────────────────

export interface SortableTabItemProps {
  tab: Tab;
  isActive: boolean;
  sizeMode: TabSizeMode;
  isCompact: boolean;
  groupColor?: string;
  onActivate: () => void;
  onClose: (e: ReactMouseEvent<HTMLElement>) => void;
  onContextMenu: (e: ReactMouseEvent<HTMLElement>) => void;
  groupId: string;
}

export interface TabBarInnerProps {
  className?: string;
  editorGroupId?: string;
  /** When true, a parent TabDndProvider supplies the DndContext */
  externalDnd?: boolean;
}

export interface TabBarProps {
  className?: string;
  editorGroupId?: string;
  /** When true, an ancestor TabDndProvider supplies the DndContext */
  externalDnd?: boolean;
}
