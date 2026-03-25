'use client';

import { useCallback } from 'react';

import { useModuleFiltersStore } from '@/stores/module-filters-store';
import { SidebarPortalZone } from '@/components/common/sidebar-portal-zone';
import { useSidebarStackContext } from '@/components/common/sidebar-stack';

/**
 * Thin connector: reads the registration from the filters store
 * and passes it to the generic SidebarPortalZone.
 */
export function FiltersZoneConnected({ groupId, hideModuleHeader = false, tabsMode = false }: { groupId: string; hideModuleHeader?: boolean; tabsMode?: boolean }) {
  const registration = useModuleFiltersStore((s) => s.registrations[groupId] ?? null);
  const setPortalTarget = useModuleFiltersStore((s) => s.setPortalTarget);
  const hideGroup = useModuleFiltersStore((s) => s.hideGroup);
  const stackCtx = useSidebarStackContext();

  // When rendered inside a multi-panel stacked stack, the stack already
  // provides its own header per panel — hide the internal module header
  // AND close button to avoid the double-header / double-X.
  const inStackedStack = stackCtx?.isMultiPanel && stackCtx.layout === 'stacked';
  // Note: the unified sidebar context auto-suppression is handled
  // inside SidebarPortalZone itself via useUnifiedSidebarContext.
  const shouldHideHeader = hideModuleHeader || inStackedStack;

  const handleClose = useCallback(() => {
    hideGroup(groupId);
  }, [hideGroup, groupId]);

  // Don't show the internal close button when the stack header already has one
  const showClose = registration && !tabsMode && !inStackedStack;

  return (
    <SidebarPortalZone
      groupId={groupId}
      registration={registration}
      setPortalTarget={setPortalTarget}
      onClose={showClose ? handleClose : undefined}
      hideModuleHeader={!!shouldHideHeader}
      portalClassName="overflow-y-auto p-3 space-y-2"
    />
  );
}
