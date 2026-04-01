import { useMemo } from 'react';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useModuleDetailStore } from '@/stores/module-detail-store';
import { usePanelRenderer } from '@/components/common/app-panel-bridge';
import { UnifiedSidebarContext } from '@/components/common/sidebar/sidebar-context';

// ═══════════════════════════════════════════════════════════════════════════
// CLASSIC PANEL SIDEBAR — Single right sidebar for classic mode
//
// Shows one panel at a time, chosen contextually:
//   - Detail panel when an entity is selected (reads module-detail-store directly)
//   - Filters panel (primary zone) otherwise
//
// No tabs, no DnD, no zone flipping, no stacked toggle, no overlay modes.
// The system decides what to show — the user doesn't pick.
// ═══════════════════════════════════════════════════════════════════════════

export function ClassicPanelSidebar() {
  const renderPanel = usePanelRenderer();

  const primaryZone = usePanelRegistryStore((s) => s.zones.primary);
  const secondaryZone = usePanelRegistryStore((s) => s.zones.secondary);
  const allPanels = usePanelRegistryStore((s) => s.panels);
  // Direct check: detail open in module store (independent of zone timing)
  const detailIsOpen = useModuleDetailStore((s) =>
    Object.values(s.registrations).some((r) => r?.isOpen),
  );

  // Priority: detail (when open) > secondary zone > primary zone
  const activePanel = useMemo(() => {
    // Detail always takes priority when open — regardless of which zone it's in
    if (detailIsOpen) {
      const detailPanel = allPanels['detail'];
      if (detailPanel) return detailPanel;
    }
    // Secondary zone
    if (secondaryZone?.isOpen && secondaryZone.stack.length > 0) {
      const panelId = secondaryZone.activeTab ?? secondaryZone.stack[0];
      return allPanels[panelId] ?? null;
    }
    // Primary zone (filters/tools)
    if (primaryZone?.isOpen && primaryZone.stack.length > 0) {
      const panelId = primaryZone.activeTab ?? primaryZone.stack[0];
      return allPanels[panelId] ?? null;
    }
    return null;
  }, [detailIsOpen, primaryZone?.isOpen, primaryZone?.stack, primaryZone?.activeTab,
      secondaryZone?.isOpen, secondaryZone?.stack, secondaryZone?.activeTab, allPanels]);

  if (!activePanel) return null;

  return (
    <div className="flex flex-col h-full surface-high">
      {/* Panel content — no header, toggle is in the module toolbar */}
      <UnifiedSidebarContext.Provider value={{ zone: activePanel.zone, isMultiPanel: false, viewMode: 'tabs', suppressModuleHeader: true }}>
        <div className="flex-1 overflow-hidden">
          {renderPanel(activePanel.id)}
        </div>
      </UnifiedSidebarContext.Provider>
    </div>
  );
}
