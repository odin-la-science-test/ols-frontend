'use client';

import { useCallback } from 'react';

import { PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useSidebarModeStore } from '@/stores/sidebar-mode-store';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  usePanelRegistryStore,
  type PanelZone,
} from '@/stores/panel-registry-store';
import { useDndZoneHandler, useShellDnd, type DragMeta } from '@/components/common/shell-dnd-context';

// ─── Edge drop zones for sidebars ───────────────────────────────────────

/**
 * Visual drop targets that appear on left/right screen edges during drag.
 *
 * Two modes depending on what's being dragged:
 * - **Panel drag**: each edge shows 2 stacked targets (Primary + Secondary)
 *   so the user chooses both target zone AND side.
 * - **Sidebar-zone drag**: each edge shows a simple directional target
 *   to move the sidebar to that side.
 */
export function SidebarEdgeDropZones() {
  const { activeDrag } = useShellDnd();
  const primarySide = useSidebarModeStore((s) => s.primarySide);
  const secondarySide = useSidebarModeStore((s) => s.secondarySide);

  const isZoneDrag = activeDrag?.type === 'sidebar-zone';
  const isPanelDrag = activeDrag?.type === 'sidebar-panel';
  const isDragging = isZoneDrag || isPanelDrag;
  const dragSource = activeDrag?.source as PanelZone | undefined;

  // ── Handler for all edge drops ──
  useDndZoneHandler(
    'sidebar-edge-drop',
    useCallback((event: DragEndEvent) => {
      const meta = event.active.data.current as DragMeta | undefined;
      if (!meta || (meta.type !== 'sidebar-panel' && meta.type !== 'sidebar-zone')) return;
      const over = event.over;
      if (!over) return;
      const overData = over.data.current as Record<string, unknown> | undefined;
      if (overData?.type !== 'sidebar-edge-zone') return;

      const targetSide = overData.side as 'left' | 'right';
      if (!targetSide) return;

      const modeStore = useSidebarModeStore.getState();
      const panelStore = usePanelRegistryStore.getState();

      // Sidebar-zone drag: move zone to target side
      if (meta.type === 'sidebar-zone') {
        const sourceZone = meta.source as PanelZone;
        if (sourceZone === 'primary') modeStore.setPrimarySide(targetSide);
        else if (sourceZone === 'secondary') modeStore.setSecondarySide(targetSide);
        return;
      }

      // Panel drag: explicit target zone from split drop targets
      const targetZone = overData.targetZone as PanelZone | undefined;
      if (targetZone) {
        const sourceZone = meta.source as PanelZone;
        // Move panel to target zone if different
        if (targetZone !== sourceZone) {
          panelStore.movePanel(meta.id, targetZone);
        }
        // Ensure the target zone is on the correct side
        if (targetZone === 'primary' && modeStore.primarySide !== targetSide) {
          modeStore.setPrimarySide(targetSide);
        } else if (targetZone === 'secondary' && modeStore.secondarySide !== targetSide) {
          modeStore.setSecondarySide(targetSide);
        }
        panelStore.openZone(targetZone);
      }
    }, []),
  );

  if (!isDragging) return null;

  // ── Sidebar-zone drag: only show the side it's NOT already on ──
  if (isZoneDrag) {
    const currentSide = dragSource === 'primary' ? primarySide
      : dragSource === 'secondary' ? secondarySide : null;
    const targetSide = currentSide === 'left' ? 'right' : 'left';

    return <DirectionalEdgeTarget side={targetSide} />;
  }

  // ── Panel drag: only show zones the panel is NOT already in ──
  return (
    <>
      <SplitEdgeTarget side="left" dragSource={dragSource} />
      <SplitEdgeTarget side="right" dragSource={dragSource} />
    </>
  );
}

// ─── Directional edge target (sidebar-zone drags) ────────────────────────

function DirectionalEdgeTarget({ side }: { side: 'left' | 'right' }) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({
    id: `sidebar-edge-${side}`,
    data: { type: 'sidebar-edge-zone', side } as const,
  });

  const Icon = side === 'left' ? PanelLeftOpen : PanelRightOpen;
  const label = side === 'left'
    ? t('workspace.moveToLeft', 'Gauche')
    : t('workspace.moveToRight', 'Droite');

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'absolute top-0 bottom-0 z-[60] pointer-events-auto flex items-center transition-all duration-200',
        side === 'left' ? 'left-0' : 'right-0',
        isOver ? 'w-14' : 'w-10',
      )}
    >
      <div className={cn(
        'absolute inset-y-0 left-0 right-0 transition-all duration-200 rounded-sm',
        isOver ? 'bg-primary/15 border border-primary/40' : 'bg-muted/30 border border-transparent',
      )} />
      <div className={cn(
        'absolute inset-0 flex flex-col items-center justify-center gap-2 transition-all duration-200',
        isOver ? 'opacity-100' : 'opacity-60',
      )}>
        <Icon className={cn('h-4 w-4 shrink-0 transition-colors', isOver ? 'text-primary' : 'text-muted-foreground/70')} />
        <span className={cn(
          'text-[9px] font-medium uppercase tracking-widest [writing-mode:vertical-lr] transition-colors',
          isOver ? 'text-primary' : 'text-muted-foreground/50',
        )}>
          {label}
        </span>
      </div>
      <div className={cn(
        'absolute top-2 bottom-2 w-[3px] rounded-full transition-all duration-150',
        side === 'left' ? 'left-0' : 'right-0',
        isOver ? 'opacity-100 bg-primary shadow-[0_0_8px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]' : 'opacity-0',
      )} />
    </div>
  );
}

// ─── Split edge target (panel drags — Primary + Secondary stacked) ───────

function SplitEdgeTarget({ side, dragSource }: { side: 'left' | 'right'; dragSource: PanelZone | undefined }) {
  const primarySide = useSidebarModeStore((s) => s.primarySide);
  const secondarySide = useSidebarModeStore((s) => s.secondarySide);

  // Only show zones the panel is NOT already in on this side
  const showPrimary = !(dragSource === 'primary' && primarySide === side);
  const showSecondary = !(dragSource === 'secondary' && secondarySide === side);
  const targets = [
    showPrimary && 'primary' as const,
    showSecondary && 'secondary' as const,
  ].filter(Boolean) as ('primary' | 'secondary')[];

  if (targets.length === 0) return null;

  return (
    <div className={cn(
      'absolute top-0 bottom-0 z-[60] pointer-events-auto flex flex-col transition-all duration-200',
      side === 'left' ? 'left-0' : 'right-0',
      'w-12',
    )}>
      {targets.map((zone, i) => (
        <EdgeHalfTarget key={zone} side={side} targetZone={zone} isSingle={targets.length === 1} isTop={i === 0} />
      ))}
    </div>
  );
}

function EdgeHalfTarget({
  side,
  targetZone,
  isSingle,
  isTop,
}: {
  side: 'left' | 'right';
  targetZone: 'primary' | 'secondary';
  /** Only one target visible — take full height */
  isSingle: boolean;
  isTop: boolean;
}) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({
    id: `sidebar-edge-${side}-${targetZone}`,
    data: { type: 'sidebar-edge-zone', targetZone, side } as const,
  });

  const label = targetZone === 'primary'
    ? t('workspace.primarySidebar', 'Primary')
    : t('workspace.secondarySidebar', 'Secondary');

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-1 relative flex items-center justify-center transition-all duration-200',
        !isSingle && (isTop ? 'pb-px' : 'pt-px'),
      )}
    >
      <div className={cn(
        'absolute inset-0 transition-all duration-200',
        isSingle ? 'rounded-sm' : isTop ? 'rounded-t-sm' : 'rounded-b-sm',
        isOver ? 'bg-primary/15 border border-primary/40' : 'bg-muted/30 border border-transparent',
      )} />
      <div className={cn(
        'relative flex flex-col items-center justify-center gap-1 transition-all duration-200',
        isOver ? 'opacity-100' : 'opacity-60',
      )}>
        <span className={cn(
          'text-[9px] font-medium uppercase tracking-widest [writing-mode:vertical-lr] transition-colors',
          isOver ? 'text-primary' : 'text-muted-foreground/50',
        )}>
          {label}
        </span>
      </div>
        <div className={cn(
          'absolute top-2 bottom-2 w-[3px] rounded-full bg-primary shadow-[0_0_8px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]',
          side === 'left' ? 'left-0' : 'right-0',
        )} />
    </div>
  );
}
