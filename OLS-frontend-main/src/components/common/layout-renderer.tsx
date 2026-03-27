'use client';

import { Fragment, type ReactNode, type RefObject } from 'react';

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import type { LayoutNode, PanelSlot } from '@/lib/layout-engine';
import type { PanelImperativeHandle } from 'react-resizable-panels';

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT RENDERER — Walks the layout-engine tree and renders ResizablePanels
//
// Slot renderers are provided by the parent (app-shell) so this component
// stays generic and reusable.
// ═══════════════════════════════════════════════════════════════════════════

export interface SlotRenderers {
  'primary-sidebar': () => ReactNode;
  'secondary-sidebar': () => ReactNode;
  center: () => ReactNode;
  bottom: () => ReactNode;
}

export interface PanelRefs {
  'primary-sidebar': RefObject<PanelImperativeHandle | null>;
  'secondary-sidebar': RefObject<PanelImperativeHandle | null>;
  bottom: RefObject<PanelImperativeHandle | null>;
}

interface LayoutRendererProps {
  tree: LayoutNode;
  renderers: SlotRenderers;
  panelRefs: PanelRefs;
}

export function LayoutRenderer({ tree, renderers, panelRefs }: LayoutRendererProps) {
  return <RenderNode node={tree} renderers={renderers} panelRefs={panelRefs} />;
}

// ─── Recursive renderer ─────────────────────────────────────────────────

function RenderNode({
  node,
  renderers,
  panelRefs,
}: {
  node: LayoutNode;
  renderers: SlotRenderers;
  panelRefs: PanelRefs;
}) {
  if (node.type === 'panel') {
    return (
      <RenderLeaf
        slot={node.slot}
        id={node.id}
        defaultSize={node.defaultSize}
        minSize={node.minSize}
        maxSize={node.maxSize}
        collapsible={node.collapsible}
        renderers={renderers}
        panelRefs={panelRefs}
      />
    );
  }

  // Group node
  const { orientation, id, children } = node;

  // Always render the ResizablePanelGroup wrapper, even with 1 child.
  // Flattening would change the React component hierarchy when children are
  // added/removed (e.g. sidebar opens), causing unmount/remount of siblings.
  return (
    <ResizablePanelGroup orientation={orientation} id={`ols-${id}`}>
      {children.map((child, i) => {
        // Determine if this child needs a handle before it (all except first)
        const needsHandle = i > 0;

        // For group children inside a parent group, they need to be wrapped
        // in a ResizablePanel if they're not a panel leaf
        if (child.type === 'group') {
          // Calculate default size for nested groups
          const defaultSize = getGroupDefaultSize(child, children.length, i);
          return (
            <Fragment key={child.id}>
              {needsHandle && <ResizableHandle />}
              <ResizablePanel id={child.id} defaultSize={defaultSize} minSize="20">
                <RenderNode node={child} renderers={renderers} panelRefs={panelRefs} />
              </ResizablePanel>
            </Fragment>
          );
        }

        // Panel leaf
        return (
          <Fragment key={child.id}>
            {needsHandle && <ResizableHandle />}
            <RenderLeaf
              slot={child.slot}
              id={child.id}
              defaultSize={child.defaultSize}
              minSize={child.minSize}
              maxSize={child.maxSize}
              collapsible={child.collapsible}
              renderers={renderers}
              panelRefs={panelRefs}
            />
          </Fragment>
        );
      })}
    </ResizablePanelGroup>
  );
}

// ─── Leaf renderer ──────────────────────────────────────────────────────

function RenderLeaf({
  slot,
  id,
  defaultSize,
  minSize,
  maxSize,
  collapsible,
  renderers,
  panelRefs,
}: {
  slot: PanelSlot;
  id: string;
  defaultSize: string;
  minSize: string;
  maxSize?: string;
  collapsible?: boolean;
  renderers: SlotRenderers;
  panelRefs: PanelRefs;
}) {
  const ref = slot === 'center' ? undefined : panelRefs[slot];

  return (
    <ResizablePanel
      panelRef={ref}
      id={id}
      defaultSize={defaultSize}
      minSize={minSize}
      maxSize={maxSize}
      collapsible={collapsible}
      collapsedSize={collapsible ? '0' : undefined}
    >
      <div style={{ height: '100%', overflow: 'hidden' }}>
        {renderers[slot]()}
      </div>
    </ResizablePanel>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function getGroupDefaultSize(
  _child: LayoutNode,
  siblingCount: number,
  _index: number,
): string {
  // Divide space roughly equally among siblings, but give more to center-ish groups
  if (siblingCount <= 1) return '100';
  if (siblingCount === 2) return '70';
  return '60';
}
