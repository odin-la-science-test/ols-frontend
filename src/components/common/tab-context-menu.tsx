'use client';

import { useTranslation } from 'react-i18next';
import {
  Pin,
  PinOff,
  X,
  XCircle,
  ArrowRight,
  Palette,
  Copy,
  FolderPlus,
  FolderMinus,
  Columns2,
  Rows2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTabsStore, TAB_GROUP_COLORS, type Tab, type TabGroup } from '@/stores';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { BarContextMenu, MenuItem, MenuSeparator, SubMenu } from './bar-context-menu';

// ═══════════════════════════════════════════════════════════════════════════
// TAB CONTEXT MENU - Right-click menu on tabs
// Pin/Unpin, Close, Close Others, Close to Right, Tab Groups, Split
// Uses shared BarContextMenu primitives.
// ═══════════════════════════════════════════════════════════════════════════

interface TabContextMenuProps {
  tab: Tab;
  position: { x: number; y: number };
  onClose: () => void;
}

export function TabContextMenu({ tab, position, onClose }: TabContextMenuProps) {
  const { t } = useTranslation();
  const { tabs, removeTab, closeOtherTabs, closeTabsToRight, togglePinTab, groups, createGroup, assignTabToGroup, removeGroup } = useTabsStore();
  const { splitActive, enableSplit, moveTabToGroup, splitDirection, setSplitDirection } = useEditorGroupsStore();

  const isPinned = tab.pinned ?? false;
  const tabIndex = tabs.findIndex((t) => t.id === tab.id);
  const tabsToRight = tabs.slice(tabIndex + 1).filter((t) => !t.pinned);
  const otherTabs = tabs.filter((t) => t.id !== tab.id && !t.pinned);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <BarContextMenu position={position} onClose={onClose} estimatedHeight={340}>
      {/* Pin / Unpin */}
      <MenuItem
        icon={isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        label={isPinned ? t('tabs.unpin') : t('tabs.pin')}
        onClick={() => handleAction(() => togglePinTab(tab.id))}
      />

      <MenuSeparator />

      {/* Close actions */}
      <MenuItem
        icon={<X className="h-3.5 w-3.5" />}
        label={t('tabs.closeTab')}
        onClick={() => handleAction(() => removeTab(tab.id))}
        disabled={isPinned}
      />
      <MenuItem
        icon={<XCircle className="h-3.5 w-3.5" />}
        label={t('tabs.closeOthers')}
        onClick={() => handleAction(() => closeOtherTabs(tab.id))}
        disabled={otherTabs.length === 0}
      />
      <MenuItem
        icon={<ArrowRight className="h-3.5 w-3.5" />}
        label={t('tabs.closeToRight')}
        onClick={() => handleAction(() => closeTabsToRight(tab.id))}
        disabled={tabsToRight.length === 0}
      />
      <MenuItem
        label={t('tabs.closeAll')}
        onClick={() => handleAction(() => useTabsStore.getState().closeAllTabs())}
        danger
      />

      <MenuSeparator />

      {/* Tab Groups */}
      <SubMenu icon={<Palette className="h-3.5 w-3.5" />} label={t('tabs.groups.title')}>
        {/* Create new group */}
        <MenuItem
          icon={<FolderPlus className="h-3.5 w-3.5" />}
          label={t('tabs.groups.newGroup')}
          onClick={() => {
            const groupId = createGroup(t('tabs.groups.defaultName'), 'violet');
            assignTabToGroup(tab.id, groupId);
            onClose();
          }}
        />

        {groups.length > 0 && <MenuSeparator />}

        {/* Existing groups */}
        {groups.map((group: TabGroup) => {
          const colorDef = TAB_GROUP_COLORS.find((c) => c.id === group.color);
          const isInGroup = tab.groupId === group.id;
          return (
            <MenuItem
              key={group.id}
              icon={
                <span
                  className="w-3 h-3 rounded-full border border-white/20"
                  style={{ backgroundColor: colorDef?.value ?? 'rgb(139 92 246)' }}
                />
              }
              label={isInGroup ? `✓ ${group.label}` : group.label}
              onClick={() => handleAction(() => assignTabToGroup(tab.id, isInGroup ? null : group.id))}
            />
          );
        })}

        {/* Remove from group */}
        {tab.groupId && (
          <>
            <MenuSeparator />
            <MenuItem
              icon={<FolderMinus className="h-3.5 w-3.5" />}
              label={t('tabs.groups.removeFromGroup')}
              onClick={() => handleAction(() => assignTabToGroup(tab.id, null))}
            />
          </>
        )}

        {/* Delete group (if tab is in one) */}
        {tab.groupId && (
          <MenuItem
            icon={<X className="h-3.5 w-3.5" />}
            label={t('tabs.groups.deleteGroup')}
            onClick={() => handleAction(() => removeGroup(tab.groupId!))}
            danger
          />
        )}

        {/* Group color picker */}
        {tab.groupId && (
          <>
            <MenuSeparator />
            <div className="px-3 py-1.5">
              <p className="text-[10px] text-muted-foreground mb-1.5">{t('tabs.groups.color')}</p>
              <div className="flex gap-1 flex-wrap">
                {TAB_GROUP_COLORS.map((color) => {
                  const group = groups.find((g: TabGroup) => g.id === tab.groupId);
                  const isActive = group?.color === color.id;
                  return (
                    <button
                      key={color.id}
                      onClick={() => {
                        if (tab.groupId) {
                          useTabsStore.getState().recolorGroup(tab.groupId, color.id);
                        }
                        onClose();
                      }}
                      className={cn(
                        'w-5 h-5 rounded-full border-2 transition-transform hover:scale-110',
                        isActive ? 'border-foreground scale-110' : 'border-transparent',
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}
      </SubMenu>

      <MenuSeparator />

      {/* Split view — two mutually exclusive direction options */}
      <MenuItem
        icon={<Columns2 className="h-3.5 w-3.5" />}
        label={t('editorGroups.splitHorizontal', 'Diviser à droite')}
        onClick={() => {
          if (!splitActive) {
            enableSplit('horizontal');
            moveTabToGroup(tab.id, 'split');
          } else if (splitDirection === 'horizontal') {
            useEditorGroupsStore.getState().disableSplit();
          } else {
            setSplitDirection('horizontal');
          }
          onClose();
        }}
        checked={splitActive && splitDirection === 'horizontal'}
      />
      <MenuItem
        icon={<Rows2 className="h-3.5 w-3.5" />}
        label={t('editorGroups.splitVertical', 'Diviser en bas')}
        onClick={() => {
          if (!splitActive) {
            enableSplit('vertical');
            moveTabToGroup(tab.id, 'split');
          } else if (splitDirection === 'vertical') {
            useEditorGroupsStore.getState().disableSplit();
          } else {
            setSplitDirection('vertical');
          }
          onClose();
        }}
        checked={splitActive && splitDirection === 'vertical'}
      />
      {splitActive && (
        <MenuItem
          icon={<Columns2 className="h-3.5 w-3.5" />}
          label={t('tabs.moveToOtherGroup', 'Déplacer vers l\'autre groupe')}
          onClick={() => {
            const groups = useEditorGroupsStore.getState().groups;
            const currentGroup = groups.find(g => g.tabIds.includes(tab.id));
            const targetGroupId = currentGroup?.id === 'main' ? 'split' : 'main';
            moveTabToGroup(tab.id, targetGroupId);
            onClose();
          }}
        />
      )}

      {/* Copy path */}
      <MenuItem
        icon={<Copy className="h-3.5 w-3.5" />}
        label={t('tabs.copyPath')}
        onClick={() => {
          navigator.clipboard.writeText(window.location.origin + tab.path);
          onClose();
        }}
      />
    </BarContextMenu>
  );
}
