'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Rows2,
  PanelTop,
  Layers,
  Pin,
  Plus,
  ArrowLeftRight,
  GripVertical,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { useDraggable } from '@dnd-kit/core';
import type { PanelZone, PanelRegistration } from '@/stores/panel-registry-store';
import type { DragMeta } from '@/components/common/shell-dnd-context';

export interface SidebarHeaderProps {
  zone: PanelZone;
  isActivity: boolean;
  isLeft: boolean;
  isOverlay: boolean;
  isPinned: boolean;
  isMultiPanel: boolean;
  headerTitle: string;
  density: string;
  viewMode: 'tabs' | 'stacked';
  currentMode: string;
  /** Available panels to add (activity-panel only) */
  availablePanels: PanelRegistration[];
  stackLength: number;
  toggleMode: (() => void) | null;
  toggleViewMode: () => void;
  closeZone: () => void;
  addToZone: (panelId: string) => void;
  flipSide: () => void;
}

export function SidebarHeader({
  zone,
  isActivity,
  isLeft,
  isPinned,
  isMultiPanel,
  headerTitle,
  density,
  viewMode,
  currentMode,
  availablePanels,
  stackLength,
  toggleMode,
  toggleViewMode,
  closeZone,
  addToZone,
  flipSide,
}: SidebarHeaderProps) {
  const { t } = useTranslation();

  // + button menu state (activity only)
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [addMenuPos, setAddMenuPos] = useState<{ top: number; left: number } | null>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const openAddMenu = useCallback(() => {
    if (addBtnRef.current) {
      const r = addBtnRef.current.getBoundingClientRect();
      setAddMenuPos({ top: r.bottom + 4, left: r.left });
    }
    setAddMenuOpen((v) => !v);
  }, []);

  useEffect(() => {
    if (!addMenuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        addBtnRef.current?.contains(target) ||
        addMenuRef.current?.contains(target)
      ) return;
      setAddMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [addMenuOpen]);

  // Sidebar-zone draggable (primary/secondary only)
  const { attributes: zoneDragAttrs, listeners: zoneDragListeners, setNodeRef: setZoneDragRef } = useDraggable({
    id: `sidebar-zone-${zone}`,
    data: { type: 'sidebar-zone', id: zone, source: zone } satisfies DragMeta,
    disabled: isActivity,
  });

  return (
    <div
      className={cn(
        'flex items-center px-2.5 border-b border-[color-mix(in_srgb,var(--color-border)_30%,transparent)] justify-between shrink-0 relative',
        density === 'compact' ? 'h-7' : 'h-9',
      )}
    >
      {/* Title — zone name for primary/secondary, panel label for activity */}
      <span
        ref={!isActivity ? setZoneDragRef : undefined}
        {...(!isActivity ? { ...zoneDragAttrs, ...zoneDragListeners } : {})}
        className={cn(
          'text-[11px] font-medium text-muted-foreground/80 uppercase tracking-wider select-none truncate flex items-center gap-1',
          !isActivity && 'cursor-grab active:cursor-grabbing',
        )}
      >
        {!isActivity && <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
        {headerTitle}
      </span>
      <div className="flex items-center gap-px shrink-0 ml-1">
        {/* + button (activity only) */}
        {isActivity && availablePanels.length > 0 && stackLength < 2 && (
          <div data-add-menu>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  ref={addBtnRef}
                  onClick={openAddMenu}
                  className={cn(
                    'p-0.5 rounded transition-colors',
                    'text-muted-foreground/70 hover:text-foreground hover:bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)]',
                    addMenuOpen && 'bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)] text-foreground',
                  )}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{t('workspace.addPanel', 'Ajouter un panneau')}</TooltipContent>
            </Tooltip>
            {addMenuOpen && addMenuPos && createPortal(
              <div
                ref={addMenuRef}
                className="fixed z-[9999] min-w-[140px] bg-popover border border-border rounded-lg shadow-lg py-1"
                style={{ top: addMenuPos.top, left: addMenuPos.left }}
              >
                {availablePanels.map((p) => (
                  <button
                    key={p.id}
                    onMouseDown={(e) => { e.stopPropagation(); addToZone(p.id); setAddMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[color-mix(in_srgb,var(--color-muted)_50%,transparent)] text-foreground transition-colors whitespace-nowrap"
                  >
                    {p.label}
                  </button>
                ))}
              </div>,
              document.body,
            )}
          </div>
        )}
        {/* Move to other side (primary/secondary only) */}
        {!isActivity && (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={flipSide}
                className={cn(
                  'p-0.5 rounded transition-colors',
                  'text-muted-foreground/70 hover:text-foreground hover:bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)]',
                )}
              >
                <ArrowLeftRight className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isLeft
                ? t('workspace.moveToRight', 'Deplacer a droite')
                : t('workspace.moveToLeft', 'Deplacer a gauche')
              }
            </TooltipContent>
          </Tooltip>
        )}
        {/* Mode toggle: dock -> overlay -> pinned -> dock */}
        {toggleMode && (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={toggleMode}
                className={cn(
                  'p-0.5 rounded transition-colors',
                  'text-muted-foreground/70 hover:text-foreground hover:bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)]',
                )}
              >
                {currentMode === 'dock' && <Layers className="h-3 w-3" />}
                {currentMode === 'overlay' && <Pin className="h-3 w-3" />}
                {isPinned && <Pin className="h-3 w-3 text-primary" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {currentMode === 'dock'
                ? t('settingsPage.sidebarModeOverlay', 'Superposer')
                : currentMode === 'overlay'
                ? t('settingsPage.sidebarModePinned', 'Epingler (sans fond)')
                : t('settingsPage.sidebarModeDock', 'Ancrer')
              }
            </TooltipContent>
          </Tooltip>
        )}
        {/* View mode toggle (when multi-panel) */}
        {isMultiPanel && (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={toggleViewMode}
                className={cn(
                  'p-0.5 rounded transition-colors',
                  'text-muted-foreground/70 hover:text-foreground hover:bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)]',
                )}
              >
                {viewMode === 'tabs'
                  ? <Rows2 className="h-3 w-3" />
                  : <PanelTop className="h-3 w-3" />
                }
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {viewMode === 'tabs'
                ? t('workspace.sidebarLayoutStacked', 'Vue empilee')
                : t('workspace.sidebarLayoutTabs', 'Vue onglets')
              }
            </TooltipContent>
          </Tooltip>
        )}
        {/* Hide button — closes the zone but preserves the stack so panels restore on reopen */}
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={closeZone}
              className={cn(
                'p-0.5 rounded',
                'text-muted-foreground/70 hover:text-foreground hover:bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)]',
                'transition-colors',
              )}
            >
              {isLeft
                ? <ChevronLeft className="h-3 w-3" />
                : <ChevronRight className="h-3 w-3" />
              }
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('workspace.hideSidebar')}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
