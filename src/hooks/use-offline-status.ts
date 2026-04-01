import { useCallback, useSyncExternalStore } from 'react';

import { offlineQueue } from '@/lib/offline-queue';

// ═══════════════════════════════════════════════════════════════════════════
// USE OFFLINE STATUS — React hook for offline queue state
//
// Uses useSyncExternalStore for tear-free reads of the singleton.
// Returns isOnline boolean and pendingCount of queued mutations.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Subscribe adapter for useSyncExternalStore.
 * Re-renders when online status or pending count changes.
 */
function subscribeToQueue(onStoreChange: () => void): () => void {
  return offlineQueue.subscribe(() => onStoreChange());
}

export interface OfflineStatus {
  isOnline: boolean;
  pendingCount: number;
}

export function useOfflineStatus(): OfflineStatus {
  const isOnline = useSyncExternalStore(
    subscribeToQueue,
    useCallback(() => offlineQueue.getSnapshot(), []),
    useCallback(() => true, []), // SSR: assume online
  );

  const pendingCount = useSyncExternalStore(
    subscribeToQueue,
    useCallback(() => offlineQueue.getPendingSnapshot(), []),
    useCallback(() => 0, []), // SSR: no pending
  );

  return { isOnline, pendingCount };
}
