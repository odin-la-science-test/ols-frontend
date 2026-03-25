import { useBottomPanelStore } from '@/stores/bottom-panel-store';

// ═══════════════════════════════════════════════════════════════════════════
// USE ACTIVITY LOG — Convenience hook for modules
//
// Wraps useBottomPanelStore.addLogEntry so modules don't import the store
// directly. Follows the same pattern as useHistory.
// ═══════════════════════════════════════════════════════════════════════════

export function useActivityLog() {
  const log = useBottomPanelStore((s) => s.addLogEntry);
  return { log };
}
