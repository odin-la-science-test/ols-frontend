'use client';

import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModuleToolbarStore } from '@/stores/module-toolbar-store';
import { useModuleFiltersStore } from '@/stores/module-filters-store';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useEditorGroupId } from '@/components/common/editor-group-context';
import { useThemeStore } from '@/stores';
import { IconButtonWithTooltip, Button } from '@/components/ui';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE TOOLBAR - Shell-level contextual actions for the active module
//
// Rendered in the breadcrumbs row (right-aligned) by AppShell.
// Reads module-toolbar-store to know which actions are available.
// Only visible on desktop (lg:) when a module is registered.
//
// Current actions:
//   - Filter toggle (open/close the filters sidebar panel)
//     → targets only THIS editor group's filter zone
//
// Other actions (view mode, compare, export) live in MenuBar → Module menu.
// On mobile, these actions are consolidated in ModuleHeader's overflow menu.
// ═══════════════════════════════════════════════════════════════════════════

interface ModuleToolbarProps {
  className?: string;
  forceVisible?: boolean;
}

export function ModuleToolbar({ className, forceVisible = false }: ModuleToolbarProps) {
  const { t } = useTranslation();
  const editorGroupId = useEditorGroupId();
  const toolbar = useModuleToolbarStore((s) => s.registration);
  const moduleFilters = useModuleFiltersStore((s) => s.getMainRegistration());
  const hiddenGroups = useModuleFiltersStore((s) => s.hiddenGroups);
  const hideGroup = useModuleFiltersStore((s) => s.hideGroup);
  const unhideGroup = useModuleFiltersStore((s) => s.unhideGroup);
  const showOnlyGroup = useModuleFiltersStore((s) => s.showOnlyGroup);
  const primaryZone = usePanelRegistryStore((s) => s.zones.primary ?? { stack: [], activeTab: null, viewMode: 'tabs' as const, isOpen: false });
  const activePanel = primaryZone.isOpen ? primaryZone.activeTab : null;
  const iconOnlyButtons = useThemeStore((s) => s.iconOnlyButtons);
  const closeZone = usePanelRegistryStore((s) => s.closeZone);
  const setZoneStack = usePanelRegistryStore((s) => s.setZoneStack);

  // Resolve the actual zone tools lives in (user may have moved it via DnD)
  const toolsZone = usePanelRegistryStore((s) => s.getZoneForPanel('tools', 'primary'));
  const toolsZoneState = usePanelRegistryStore((s) => s.zones[toolsZone] ?? { stack: [], activeTab: null, viewMode: 'tabs' as const, isOpen: false });
  const activeToolsPanel = toolsZoneState.isOpen ? toolsZoneState.activeTab : null;

  // Only render when a module is active
  if (!toolbar && !moduleFilters && !forceVisible) return null;

  // Panel is "active" for this group when open AND this group's zone is not hidden
  const panelOpen = activeToolsPanel === 'tools';
  const groupHidden = hiddenGroups.has(editorGroupId);
  // Show as "active" when panel is open and THIS group's filters are visible
  const isActive = panelOpen && !groupHidden;

  const handleFilterToggle = () => {
    if (panelOpen && !groupHidden) {
      // Visible → close the zone entirely
      closeZone(toolsZone);
    } else if (panelOpen && groupHidden) {
      // Panel open but this group hidden (split mode) → make it visible
      unhideGroup(editorGroupId);
    } else {
      // Panel closed → open it, show only this group first
      showOnlyGroup(editorGroupId);
      setZoneStack(toolsZone, ['tools']);
    }
  };

  return (
    <div className={cn('flex items-center gap-0.5 shrink-0', className)}>
      {iconOnlyButtons ? (
        <IconButtonWithTooltip
          icon={<SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />}
          tooltip={t('activityBar.modulePanel')}
          onClick={handleFilterToggle}
          className="h-6 w-6"
        />
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFilterToggle}
          className={cn(
            'h-6 gap-1.5 px-2 text-[11px] font-normal text-muted-foreground hover:text-foreground hover:bg-muted/50',
            isActive && 'bg-muted/40 text-foreground'
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
          {t('activityBar.modulePanel')}
        </Button>
      )}
    </div>
  );
}
