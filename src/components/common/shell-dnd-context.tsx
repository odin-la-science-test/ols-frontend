'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  closestCenter,
  type CollisionDetection,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';

// ═══════════════════════════════════════════════════════════════════════════
// SHELL DND CONTEXT — Single DnD provider for the entire app shell
//
// Centralises drag state so multiple drop zones (tab bars, sidebars,
// bottom panel, dashboard) can interoperate.
//
// Each drop zone registers its own onDragEnd handler via context.
// The overlay renders the currently dragged item for smooth visuals.
// ═══════════════════════════════════════════════════════════════════════════

/** Dragged item metadata */
export interface DragMeta {
  /** What kind of item is being dragged */
  type: 'tab' | 'widget' | 'bottom-tab' | 'sidebar-panel' | 'sidebar-zone';
  /** Unique id of the dragged item */
  id: string;
  /** Extra data (e.g. source editor group for tabs) */
  source?: string;
}

interface ShellDndContextValue {
  /** Currently active drag, if any */
  activeDrag: DragMeta | null;
}

const ShellDndCtx = createContext<ShellDndContextValue>({ activeDrag: null });

export function useShellDnd() {
  return useContext(ShellDndCtx);
}

/** Registry for zone-specific drag-end handlers */
type DragHandler = (event: DragEndEvent) => void;
type DragOverHandler = (event: DragOverEvent) => void;

interface HandlersRef {
  onEnd: Map<string, DragHandler>;
  onOver: Map<string, DragOverHandler>;
}

const HandlersCtx = createContext<HandlersRef>({
  onEnd: new Map(),
  onOver: new Map(),
});

/**
 * Register a drag-end handler for a specific zone.
 * The handler is called for ALL drag-end events — it should check
 * if the event is relevant before acting.
 */
export function useDndZoneHandler(
  zoneId: string,
  onEnd: DragHandler,
  onOver?: DragOverHandler,
) {
  const handlers = useContext(HandlersCtx);

  useEffect(() => {
    handlers.onEnd.set(zoneId, onEnd);
    if (onOver) handlers.onOver.set(zoneId, onOver);
    return () => {
      handlers.onEnd.delete(zoneId);
      handlers.onOver.delete(zoneId);
    };
  }, [zoneId, onEnd, onOver, handlers]);
}

/** Overlay render callback */
type OverlayRenderer = (drag: DragMeta) => ReactNode;

interface OverlayRef {
  renderers: Map<string, OverlayRenderer>;
}

const OverlayCtx = createContext<OverlayRef>({ renderers: new Map() });

/**
 * Register an overlay renderer for a drag type.
 * When an item of that type is being dragged, the renderer is called
 * to produce the DragOverlay content.
 */
export function useDndOverlay(type: DragMeta['type'], renderer: OverlayRenderer) {
  const ctx = useContext(OverlayCtx);
  useEffect(() => {
    ctx.renderers.set(type, renderer);
    return () => { ctx.renderers.delete(type); };
  }, [type, renderer, ctx]);
}

// ─── Provider ────────────────────────────────────────────────────────────

export function ShellDndProvider({ children }: { children: ReactNode }) {
  const [activeDrag, setActiveDrag] = useState<DragMeta | null>(null);

  const handlersRef = useRef<HandlersRef>({
    onEnd: new Map(),
    onOver: new Map(),
  });

  const overlayRef = useRef<OverlayRef>({ renderers: new Map() });

  // Sensors with activation constraints to avoid conflicts with clicks
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 6 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const meta = event.active.data.current as DragMeta | undefined;
    if (meta) setActiveDrag(meta);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    handlersRef.current.onOver.forEach((handler) => handler(event));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    handlersRef.current.onEnd.forEach((handler) => handler(event));
    setActiveDrag(null);
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null);
  }, []);

  const ctxValue = useMemo(() => ({ activeDrag }), [activeDrag]);

  /**
   * Custom collision detection with priority layers:
   * 1. Edge drop-zones (sidebar-edge-zone) — highest priority when pointer intersects
   * 2. pointerWithin for normal droppables (sidebar-zone, sidebar-panel tabs)
   * 3. closestCenter fallback for sortable tab reordering
   */
  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      // 1. Check ALL algorithms
      const rectHits = rectIntersection(args);
      const pointerHits = pointerWithin(args);

      // 2. If any edge zone was hit by EITHER method, it wins
      const isEdge = (c: { data?: { droppableContainer?: { data?: { current?: unknown } } } }) =>
        (c.data?.droppableContainer?.data?.current as Record<string, unknown> | undefined)?.type === 'sidebar-edge-zone';

      const edgeHit = rectHits.find(isEdge) ?? pointerHits.find(isEdge);
      if (edgeHit) return [edgeHit];

      // 3. Normal pointer-within hits (tab drops, zone drops)
      if (pointerHits.length > 0) return pointerHits;

      // 4. Fallback to closestCenter for sortable tab reordering
      return closestCenter(args);
    },
    [],
  );

  // Render the overlay from the registered renderer
  const overlayContent = useMemo(() => {
    if (!activeDrag) return null;
    const renderer = overlayRef.current.renderers.get(activeDrag.type);
    return renderer ? renderer(activeDrag) : null;
  }, [activeDrag]);

  return (
    <ShellDndCtx.Provider value={ctxValue}>
      <HandlersCtx.Provider value={handlersRef.current}>
        <OverlayCtx.Provider value={overlayRef.current}>
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            {children}
            <DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
              {overlayContent}
            </DragOverlay>
          </DndContext>
        </OverlayCtx.Provider>
      </HandlersCtx.Provider>
    </ShellDndCtx.Provider>
  );
}
