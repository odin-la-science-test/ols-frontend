import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE HISTORY STORE — Browser-style back/forward navigation for SPA routes
//
// Tracks visited pathnames in a stack with a pointer.
// goBack/goForward return the target path; the caller navigates with React Router.
// Not persisted — ephemeral per session.
// ═══════════════════════════════════════════════════════════════════════════

const MAX_STACK = 100;

interface RouteHistoryState {
  stack: string[];
  pointer: number;

  /** Track a route change. Truncates forward history if navigating after going back. */
  push: (path: string) => void;

  /** Move back one step. Returns the target path or null if at the start. */
  goBack: () => string | null;

  /** Move forward one step. Returns the target path or null if at the end. */
  goForward: () => string | null;

  canGoBack: () => boolean;
  canGoForward: () => boolean;
}

export const useRouteHistoryStore = create<RouteHistoryState>()((set, get) => ({
  stack: [],
  pointer: -1,

  push: (path) => {
    const { stack, pointer } = get();

    // Ignore if same as current position (avoids duplicates from re-renders)
    if (pointer >= 0 && stack[pointer] === path) return;

    // Truncate forward history and push new path
    const truncated = stack.slice(0, pointer + 1);
    const newStack = [...truncated, path].slice(-MAX_STACK);
    set({ stack: newStack, pointer: newStack.length - 1 });
  },

  goBack: () => {
    const { stack, pointer } = get();
    if (pointer <= 0) return null;
    const newPointer = pointer - 1;
    set({ pointer: newPointer });
    return stack[newPointer];
  },

  goForward: () => {
    const { stack, pointer } = get();
    if (pointer >= stack.length - 1) return null;
    const newPointer = pointer + 1;
    set({ pointer: newPointer });
    return stack[newPointer];
  },

  canGoBack: () => get().pointer > 0,
  canGoForward: () => {
    const { stack, pointer } = get();
    return pointer < stack.length - 1;
  },
}));
