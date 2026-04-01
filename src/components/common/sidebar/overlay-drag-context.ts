import { createContext, useContext } from 'react';
import type { DragControls } from 'framer-motion';

const OverlayDragCtx = createContext<DragControls | null>(null);
export const OverlayDragProvider = OverlayDragCtx.Provider;
export function useOverlayDragControls() {
  return useContext(OverlayDragCtx);
}
