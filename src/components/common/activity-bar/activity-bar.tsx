'use client';

import { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  useActivityBarStore,
  type ActivityBarItem,
  type ActivityBarPosition,
} from '@/stores/activity-bar-store';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useThemeStore } from '@/stores';
import { BarContextMenu, useBarContextMenuState, MenuItem, MenuSeparator, SubMenu } from '@/components/common/bar-context-menu';

import { getItemLabelKey } from './utils';
import { PanelIcon } from './panel-icon';
import { DraggableItem } from './draggable-item';
import { ActivityBarUserAvatar } from './activity-bar-user-avatar';
import { SettingsQuickMenu } from './settings-quick-menu';

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITY BAR - Barre verticale d'icones style VS Code
// Ultra-compacte (44px), a gauche de la GlobalSidebar
// Desktop only - Controle les panneaux de la sidebar
//
// Deux types d'items :
//   panel    → ouvre/ferme un panneau dans la sidebar
//   navigate → navigation directe vers une route
// ═══════════════════════════════════════════════════════════════════════════

interface ActivityBarProps {
  className?: string;
}

export function ActivityBar({ className }: ActivityBarProps) {
  const { t } = useTranslation();
  const { items, badges, togglePanel, stackPanel, reorderItems, setItemVisible, position, setPosition } = useActivityBarStore();
  const density = useThemeStore((s) => s.density);
  const { menuPosition, handleContextMenu, closeMenu } = useBarContextMenuState();
  const primaryZone = usePanelRegistryStore((s) => s.zones['activity-panel'] ?? { stack: [], activeTab: null, viewMode: 'tabs' as const, isOpen: false });
  const primarySidebarZone = usePanelRegistryStore((s) => s.zones.primary ?? { stack: [], activeTab: null, viewMode: 'tabs' as const, isOpen: false });
  const secondarySidebarZone = usePanelRegistryStore((s) => s.zones.secondary ?? { stack: [], activeTab: null, viewMode: 'tabs' as const, isOpen: false });
  const activePanel = primaryZone.isOpen ? primaryZone.activeTab : null;
  const leftStack = primaryZone.stack;
  const leftLayout = primaryZone.viewMode;

  // Also track sidebar zones for the indicator
  const primarySidebarActiveTab = primarySidebarZone.isOpen ? primarySidebarZone.activeTab : null;
  const primarySidebarStack = primarySidebarZone.stack;
  const secondarySidebarActiveTab = secondarySidebarZone.isOpen ? secondarySidebarZone.activeTab : null;
  const secondarySidebarStack = secondarySidebarZone.stack;

  const isHorizontal = position === 'top' || position === 'bottom';
  const indicatorSide = position === 'right' ? 'right' : 'left';

  // Visible items split by type (settings always anchored at bottom)
  const visibleItems = useMemo(
    () => items.filter((item) => item.visible),
    [items]
  );

  const panelItems = useMemo(
    () => visibleItems.filter((item) => item.type === 'panel'),
    [visibleItems]
  );

  const settingsItem = useMemo(
    () => visibleItems.find((item) => item.id === 'settings'),
    [visibleItems]
  );

  const handleSectionReorder = useCallback(
    (newSection: ActivityBarItem[], sectionItems: ActivityBarItem[]) => {
      // Find what moved
      for (let i = 0; i < newSection.length; i++) {
        if (newSection[i].id !== sectionItems[i]?.id) {
          const fromId = sectionItems.find((x) => !newSection.slice(0, i + 1).find((y) => y.id === x.id))?.id;
          const toId = newSection[i].id;
          if (fromId && toId) {
            const fromIdx = items.findIndex((x) => x.id === fromId);
            const toIdx = items.findIndex((x) => x.id === toId);
            if (fromIdx !== -1 && toIdx !== -1) reorderItems(fromIdx, toIdx);
          }
          break;
        }
      }
    },
    [items, reorderItems]
  );

  // All panel items are global (no more contextual module-specific items)
  const globalPanelItems = panelItems;

  // Position labels for context menu
  const positionLabels: { value: ActivityBarPosition; label: string }[] = [
    { value: 'left', label: t('activityBar.positionLeft') },
    { value: 'top', label: t('activityBar.positionTop') },
    { value: 'right', label: t('activityBar.positionRight') },
    { value: 'bottom', label: t('activityBar.positionBottom') },
  ];

  return (
    <div
      className={cn(
        'hidden lg:flex flex-shrink-0 z-30',
        'bg-card/80',
        'overflow-hidden',
        // ── Vertical layout (left/right) ──
        !isHorizontal && cn(
          'flex-col items-center',
          'overflow-y-auto overflow-x-hidden',
          position === 'right' ? 'border-l border-border/50' : 'border-r border-border/50',
          density === 'compact' ? 'w-9 py-1 gap-0.5' : 'w-11 py-2',
        ),
        // ── Horizontal layout (top/bottom) ──
        isHorizontal && cn(
          'flex-row items-center',
          position === 'bottom' ? 'border-t border-border/50' : 'border-b border-border/50',
          'overflow-x-auto overflow-y-hidden',
          density === 'compact' ? 'h-9 px-1 gap-0.5' : 'h-11 px-2',
        ),
        className
      )}
      style={{ fontSize: '16px' }}
      onContextMenu={handleContextMenu}
    >
      {/* ── Panel items (draggable) ── */}
      <Reorder.Group
        axis={isHorizontal ? 'x' : 'y'}
        values={globalPanelItems}
        onReorder={(newOrder) => handleSectionReorder(newOrder, globalPanelItems)}
        className={cn(
          'flex items-center gap-1',
          isHorizontal ? 'flex-row' : 'flex-col',
        )}
      >
        {globalPanelItems.map((item) => {
          // Check activity-panel zone
          const inActivityStack = leftStack.includes(item.id);
          const isActivityStacked = leftStack.length > 1 && inActivityStack;
          const isActivityActive = leftLayout === 'stacked' && isActivityStacked
            ? true
            : activePanel === item.id;

          // Check primary sidebar zone
          const inPrimaryStack = primarySidebarStack.includes(item.id);
          const isPrimaryActive = primarySidebarZone.isOpen && inPrimaryStack
            && (primarySidebarZone.viewMode === 'stacked'
              ? true
              : primarySidebarActiveTab === item.id);

          // Check secondary sidebar zone
          const inSecondaryStack = secondarySidebarStack.includes(item.id);
          const isSecondaryActive = secondarySidebarZone.isOpen && inSecondaryStack
            && (secondarySidebarZone.viewMode === 'stacked'
              ? true
              : secondarySidebarActiveTab === item.id);

          // Combined: active in any zone
          const isActive = isActivityActive || isPrimaryActive || isSecondaryActive;
          const isStacked = isActivityStacked
            || (primarySidebarStack.length > 1 && inPrimaryStack)
            || (secondarySidebarStack.length > 1 && inSecondaryStack);

          return (
          <DraggableItem key={item.id} item={item} axis={isHorizontal ? 'x' : 'y'}>
            <PanelIcon
              item={item}
              isActive={isActive}
              isStacked={isStacked}
              badge={badges[item.id]}
              indicatorSide={indicatorSide}
              barPosition={position}
              onToggle={(e) => {
                if (e?.ctrlKey || e?.metaKey) {
                  stackPanel(item.id);
                } else {
                  togglePanel(item.id);
                }
              }}
            />
          </DraggableItem>
          );
        })}
      </Reorder.Group>

      {/* ── Bottom/End: Avatar + Settings ── */}
      <div className={cn(
        'flex-shrink-0 flex items-center',
        isHorizontal
          ? cn('flex-row border-l border-border/30 ml-auto', density === 'compact' ? 'pl-1 gap-0.5' : 'pl-2 gap-1')
          : cn('flex-col border-t border-border/30 mt-auto', density === 'compact' ? 'pt-1 gap-0.5' : 'pt-2 gap-1'),
      )}>
        <ActivityBarUserAvatar barPosition={position} />
        {settingsItem && <SettingsQuickMenu barPosition={position} />}
      </div>

      {/* Context menu — toggle own items + position submenu */}
      {menuPosition && (
        <BarContextMenu position={menuPosition} onClose={closeMenu} estimatedHeight={280}>
          {items.map((item) => (
            <MenuItem
              key={item.id}
              label={t(getItemLabelKey(item.id))}
              onClick={() => { setItemVisible(item.id, !item.visible); closeMenu(); }}
              checked={item.visible}
            />
          ))}
          <MenuSeparator />
          {/* Position submenu */}
          <SubMenu label={t('activityBar.position')}>
            {positionLabels.map((opt) => (
              <MenuItem
                key={opt.value}
                label={opt.label}
                onClick={() => { setPosition(opt.value); closeMenu(); }}
                checked={position === opt.value}
              />
            ))}
          </SubMenu>
          <MenuSeparator />
          <MenuItem
            label={t('settingsPage.resetDefaults')}
            onClick={() => { useActivityBarStore.getState().resetToDefaults(); closeMenu(); }}
          />
          <MenuSeparator />
          <MenuItem
            label={t('activityBar.hide')}
            onClick={() => { useActivityBarStore.getState().toggleActivityBar(); closeMenu(); }}
          />
        </BarContextMenu>
      )}
    </div>
  );
}
