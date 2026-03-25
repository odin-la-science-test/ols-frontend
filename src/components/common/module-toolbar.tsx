'use client';

import { useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getModuleIcon } from '@/lib/module-icons';
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
// Reads module-toolbar-store to display module-registered actions.
// Only visible on desktop (lg:) when a module is registered.
//
// Two types of actions rendered here:
//   1. Filter toggle (shell action — always present when filters are registered)
//   2. Module toolbar actions (from ModuleAction[] with placement 'toolbar' | 'both')
//
// Menu actions (placement 'menu' | 'both') are rendered by MenuBar → ModuleMenuContent.
// On mobile, actions with mobile=true are rendered by ModuleHeader's overflow menu.
// ═══════════════════════════════════════════════════════════════════════════

interface ModuleToolbarProps {
  className?: string;
}

export function ModuleToolbar({ className }: ModuleToolbarProps) {
  const { t } = useTranslation();
  const editorGroupId = useEditorGroupId();
  const toolbar = useModuleToolbarStore((s) => s.registration);
  const moduleFilters = useModuleFiltersStore((s) => s.getMainRegistration());
  const hiddenGroups = useModuleFiltersStore((s) => s.hiddenGroups);
  const unhideGroup = useModuleFiltersStore((s) => s.unhideGroup);
  const showOnlyGroup = useModuleFiltersStore((s) => s.showOnlyGroup);
  const iconOnlyButtons = useThemeStore((s) => s.iconOnlyButtons);
  const closeZone = usePanelRegistryStore((s) => s.closeZone);
  const setZoneStack = usePanelRegistryStore((s) => s.setZoneStack);

  // Resolve the actual zone tools lives in (user may have moved it via DnD)
  const toolsZone = usePanelRegistryStore((s) => s.getZoneForPanel('tools', 'primary'));
  const toolsZoneState = usePanelRegistryStore((s) => s.zones[toolsZone] ?? { stack: [], activeTab: null, viewMode: 'tabs' as const, isOpen: false });
  const activeToolsPanel = toolsZoneState.isOpen ? toolsZoneState.activeTab : null;

  // Filter toolbar actions from registration
  const toolbarActions = toolbar?.actions.filter(
    (a) => a.placement === 'toolbar' || a.placement === 'both'
  ) ?? [];

  // Dynamic tools button label based on sidebar sections
  const sections = moduleFilters?.sidebarSections ?? [];
  const showToolsButton = sections.length > 0;
  const toolsButtonLabel = sections.length === 1
    ? t(sections[0].labelKey)
    : t('activityBar.modulePanel');

  // Only render when a module is active
  if (!toolbar && !moduleFilters) return null;

  // Panel is "active" for this group when open AND this group's zone is not hidden
  const panelOpen = activeToolsPanel === 'tools';
  const groupHidden = hiddenGroups.has(editorGroupId);
  // Show as "active" when panel is open and THIS group's filters are visible
  const isFilterActive = panelOpen && !groupHidden;

  const handleFilterToggle = () => {
    if (panelOpen && !groupHidden) {
      closeZone(toolsZone);
    } else if (panelOpen && groupHidden) {
      unhideGroup(editorGroupId);
    } else {
      showOnlyGroup(editorGroupId);
      setZoneStack(toolsZone, ['tools']);
    }
  };

  return (
    <div className={cn('flex items-center gap-0.5 shrink-0', className)}>
      {/* Module-registered toolbar actions */}
      {toolbarActions.map((action) => {
        const ActionIcon = getModuleIcon(action.icon);
        const isActive = action.isActive?.() ?? false;
        const isDisabled = action.isDisabled?.() ?? false;

        return iconOnlyButtons ? (
          <IconButtonWithTooltip
            key={action.id}
            icon={<ActionIcon className="h-3.5 w-3.5 text-muted-foreground" />}
            tooltip={t(action.labelKey)}
            onClick={action.action}
            className="h-6 w-6"
            disabled={isDisabled}
          />
        ) : (
          <Button
            key={action.id}
            variant="ghost"
            size="sm"
            onClick={action.action}
            disabled={isDisabled}
            className={cn(
              'h-6 gap-1.5 px-2 text-[11px] font-normal text-muted-foreground hover:text-foreground hover:bg-[color-mix(in_srgb,var(--color-muted)_50%,transparent)]',
              isActive && 'bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)] text-foreground'
            )}
          >
            <ActionIcon className="h-3.5 w-3.5 shrink-0" />
            {t(action.labelKey)}
          </Button>
        );
      })}

      {/* Tools toggle (present when sidebar has sections) */}
      {showToolsButton && (
        iconOnlyButtons ? (
          <IconButtonWithTooltip
            icon={<SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />}
            tooltip={toolsButtonLabel}
            onClick={handleFilterToggle}
            className="h-6 w-6"
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFilterToggle}
            className={cn(
              'h-6 gap-1.5 px-2 text-[11px] font-normal text-muted-foreground hover:text-foreground hover:bg-[color-mix(in_srgb,var(--color-muted)_50%,transparent)]',
              isFilterActive && 'bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)] text-foreground'
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
            {toolsButtonLabel}
          </Button>
        )
      )}
    </div>
  );
}

// ─── Toolbar Search (compact inline search for modules without sidebar) ──

export function ToolbarSearch({ className }: { className?: string }) {
  const toolbarSearch = useModuleFiltersStore((s) => s.toolbarSearch);
  const [local, setLocal] = useState('');
  const initialized = useRef(false);

  // Sync from store → local (on mount or external reset)
  useEffect(() => {
    if (toolbarSearch) setLocal(toolbarSearch.query);
  }, [toolbarSearch?.query]);

  // Debounce local → store
  useEffect(() => {
    if (!toolbarSearch || !initialized.current) {
      initialized.current = true;
      return;
    }
    const timer = setTimeout(() => {
      if (local !== toolbarSearch.query) toolbarSearch.setQuery(local);
    }, 300);
    return () => clearTimeout(timer);
  }, [local]);

  if (!toolbarSearch) return null;

  const handleClear = () => {
    setLocal('');
    toolbarSearch.setQuery('');
  };

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-2 h-3 w-3 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={toolbarSearch.placeholder}
        className="h-6 w-52 rounded-md border border-[color-mix(in_srgb,var(--color-border)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-background)_50%,transparent)] pl-7 pr-6 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[color-mix(in_srgb,var(--color-primary)_50%,transparent)] focus:bg-background transition-colors"
      />
      {local && (
        <button
          onClick={handleClear}
          className="absolute right-1.5 h-3.5 w-3.5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
