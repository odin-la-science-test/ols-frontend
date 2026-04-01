import type { BottomPanelAlignment } from '@/stores/bottom-panel-store';
import type { SidebarMode, SidebarSide } from '@/stores/sidebar-mode-store';

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT ENGINE — Declarative panel composition for app-shell
//
// Instead of 4 hand-written if/else blocks in app-shell.tsx, we describe
// each alignment mode as a tree of { orientation, children } nodes.
// The renderer walks the tree and produces nested ResizablePanelGroups.
//
// Node types:
//   'panel'  → leaf (sidebar / center / bottom / secondary)
//   'group'  → container with orientation + children
// ═══════════════════════════════════════════════════════════════════════════

export type PanelSlot =
  | 'primary-sidebar'
  | 'secondary-sidebar'
  | 'center'
  | 'bottom';

export interface PanelLeaf {
  type: 'panel';
  slot: PanelSlot;
  id: string;
  defaultSize: string;
  minSize: string;
  maxSize?: string;
  collapsible?: boolean;
}

export interface PanelGroup {
  type: 'group';
  orientation: 'horizontal' | 'vertical';
  id: string;
  children: LayoutNode[];
}

export type LayoutNode = PanelLeaf | PanelGroup;

// ─── Panel presets ───────────────────────────────────────────────────────

const primarySidebar = (id: string): PanelLeaf => ({
  type: 'panel',
  slot: 'primary-sidebar',
  id,
  defaultSize: '15',
  minSize: '10',
  maxSize: '30',
  collapsible: true,
});

const secondarySidebar = (id: string): PanelLeaf => ({
  type: 'panel',
  slot: 'secondary-sidebar',
  id,
  defaultSize: '25',
  minSize: '12',
  maxSize: '50',
  collapsible: true,
});

const center = (id: string, defaultSize = '60'): PanelLeaf => ({
  type: 'panel',
  slot: 'center',
  id,
  defaultSize,
  minSize: '30',
});

const bottom = (id: string): PanelLeaf => ({
  type: 'panel',
  slot: 'bottom',
  id,
  defaultSize: '30',
  minSize: '8',
  maxSize: '50',
  collapsible: true,
});

// ─── Alignment layout trees ─────────────────────────────────────────────

/**
 * Build the layout tree for a given alignment mode.
 * Panels whose sidebar is in overlay mode are excluded from the tree
 * (they render as floating overlays separately).
 *
 * primarySide / secondarySide control which physical side each sidebar occupies.
 * If both are on the same side, secondary is placed outer (further from center).
 */
export function buildLayoutTree(
  alignment: BottomPanelAlignment,
  primaryMode: SidebarMode,
  secondaryMode: SidebarMode,
  primaryOpen = false,
  secondaryOpen = false,
  primarySide: SidebarSide = 'left',
  secondarySide: SidebarSide = 'right',
): LayoutNode {
  const pDock = primaryMode === 'dock' && primaryOpen;
  const sDock = secondaryMode === 'dock' && secondaryOpen;

  // Compute dynamic center size based on how many sidebars are docked
  const centerSize = (!pDock && !sDock) ? '100' : '60';

  // Helper: build ordered horizontal children [leftSlots..., center, rightSlots...]
  // Returns the list of leaves/nodes to embed in a horizontal group
  function buildHorizontalChildren(
    centerNode: LayoutNode,
    withBottom = false,
    groupId = 'main-h',
  ): LayoutNode {
    const left: LayoutNode[] = [];
    const right: LayoutNode[] = [];

    if (pDock) {
      if (primarySide === 'left') left.push(primarySidebar('sidebar-p'));
      else right.push(primarySidebar('sidebar-p'));
    }
    if (sDock) {
      if (secondarySide === 'left') left.push(secondarySidebar('sidebar-s'));
      else right.push(secondarySidebar('sidebar-s'));
    }

    const hChildren: LayoutNode[] = [...left, centerNode, ...right];

    if (withBottom) {
      return {
        type: 'group',
        orientation: 'vertical',
        id: groupId + '-v',
        children: [
          { type: 'group', orientation: 'horizontal', id: groupId, children: hChildren },
          bottom(groupId + '-bottom'),
        ],
      };
    }
    return { type: 'group', orientation: 'horizontal', id: groupId, children: hChildren };
  }

  switch (alignment) {
    case 'center': {
      return buildHorizontalChildren(
        {
          type: 'group',
          orientation: 'vertical',
          id: 'center-vertical',
          children: [center('content', centerSize), bottom('bottom')],
        },
        false,
        'main-h',
      );
    }

    case 'left': {
      const innerCenter = center('center-left', centerSize);
      return buildHorizontalChildren(innerCenter, true, 'left-main');
    }

    case 'right': {
      const innerCenter = center('center-right', centerSize);
      return buildHorizontalChildren(innerCenter, true, 'right-main');
    }

    case 'justify':
    default: {
      const innerCenter = center('center-justify', centerSize);
      return buildHorizontalChildren(innerCenter, true, 'justify-main');
    }
  }
}
