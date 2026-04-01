'use client';

import { useEffect } from 'react';

import { useActivityBarStore } from '@/stores/activity-bar-store';
import { registry } from '@/lib/module-registry';

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITY BAR BADGE SYNC — Reactive badge count synchronization
//
// Renders a tiny invisible component per module that has a useBadgeCount
// hook in its activityPanel definition. Each component calls the hook
// (which is a standard React hook, e.g. backed by React Query) and
// syncs the count to the activity bar store. Fully reactive, no polling.
// ═══════════════════════════════════════════════════════════════════════════

interface BadgeSyncItemProps {
  panelId: string;
  useBadgeCount: () => number;
}

function BadgeSyncItem({ panelId, useBadgeCount }: BadgeSyncItemProps) {
  const count = useBadgeCount();
  const setBadge = useActivityBarStore((s) => s.setBadge);

  useEffect(() => {
    setBadge(panelId, count);
  }, [panelId, count, setBadge]);

  return null;
}

/** Renders badge sync components for all modules that provide useBadgeCount. */
export function ActivityBarBadgeSync() {
  const activityPanels = registry
    .getActivityPanels()
    .filter(({ panel }) => !!panel.useBadgeCount);

  return (
    <>
      {activityPanels.map(({ module, panel }) => (
        <BadgeSyncItem
          key={module.id}
          panelId={panel.id ?? module.id}
          useBadgeCount={panel.useBadgeCount!}
        />
      ))}
    </>
  );
}
