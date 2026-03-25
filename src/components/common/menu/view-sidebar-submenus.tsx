'use client';

import type { ReactNode } from 'react';

import { useTranslation } from 'react-i18next';
import { PanelLeft, PanelRight, Layers, Rows2, Check } from 'lucide-react';
import { MenuItem, MenuSubMenu } from './menu-primitives';

// ─── Shared types for sidebar zone sub-menus ─────────────────────────────

type SidebarMode = 'dock' | 'overlay' | 'pinned';
type ViewMode = 'tabs' | 'stacked';
type Side = 'left' | 'right';

interface SidebarZoneSubMenuProps {
  icon: ReactNode;
  label: string;
  currentMode: SidebarMode;
  onSetMode: (mode: SidebarMode) => void;
  currentViewMode: ViewMode;
  onToggleViewMode: () => void;
  onClose: () => void;
  /** If provided, shows a "Side" sub-menu */
  sideConfig?: {
    currentSide: Side;
    onSetSide: (side: Side) => void;
  };
}

export function SidebarZoneSubMenu({
  icon,
  label,
  currentMode,
  onSetMode,
  currentViewMode,
  onToggleViewMode,
  onClose,
  sideConfig,
}: SidebarZoneSubMenuProps) {
  const { t } = useTranslation();

  return (
    <MenuSubMenu icon={icon} label={label}>
      {/* Mode sub-menu */}
      <MenuSubMenu
        icon={<Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        label={t('settingsPage.sidebarModeLabel', 'Mode')}
      >
        <MenuItem onClick={() => { onSetMode('dock'); onClose(); }}>
          <span className="flex-1">{t('settingsPage.sidebarModeDock', 'Ancré')}</span>
          {currentMode === 'dock' && <Check className="h-3 w-3 text-primary shrink-0" />}
        </MenuItem>
        <MenuItem onClick={() => { onSetMode('overlay'); onClose(); }}>
          <span className="flex-1">{t('settingsPage.sidebarModeOverlay', 'Superposé')}</span>
          {currentMode === 'overlay' && <Check className="h-3 w-3 text-primary shrink-0" />}
        </MenuItem>
        <MenuItem onClick={() => { onSetMode('pinned'); onClose(); }}>
          <span className="flex-1">{t('settingsPage.sidebarModePinned', 'Épinglé')}</span>
          {currentMode === 'pinned' && <Check className="h-3 w-3 text-primary shrink-0" />}
        </MenuItem>
      </MenuSubMenu>

      {/* View mode sub-menu */}
      <MenuSubMenu
        icon={<Rows2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        label={t('settingsPage.sidebarViewLabel', 'Vue')}
      >
        <MenuItem onClick={() => { onToggleViewMode(); onClose(); }}>
          <span className="flex-1">{t('workspace.sidebarLayoutTabs', 'Onglets')}</span>
          {currentViewMode === 'tabs' && <Check className="h-3 w-3 text-primary shrink-0" />}
        </MenuItem>
        <MenuItem onClick={() => { onToggleViewMode(); onClose(); }}>
          <span className="flex-1">{t('workspace.sidebarLayoutStacked', 'Empilé')}</span>
          {currentViewMode === 'stacked' && <Check className="h-3 w-3 text-primary shrink-0" />}
        </MenuItem>
      </MenuSubMenu>

      {/* Side sub-menu (optional, for primary/secondary sidebars) */}
      {sideConfig && (
        <MenuSubMenu
          icon={sideConfig.currentSide === 'left'
            ? <PanelLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            : <PanelRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
          label={t('settingsPage.sidebarSideLabel', 'Côté')}
        >
          <MenuItem onClick={() => { sideConfig.onSetSide('left'); onClose(); }}>
            <PanelLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="flex-1">{t('activityBar.positionLeft', 'Gauche')}</span>
            {sideConfig.currentSide === 'left' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
          <MenuItem onClick={() => { sideConfig.onSetSide('right'); onClose(); }}>
            <PanelRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="flex-1">{t('activityBar.positionRight', 'Droite')}</span>
            {sideConfig.currentSide === 'right' && <Check className="h-3 w-3 text-primary shrink-0" />}
          </MenuItem>
        </MenuSubMenu>
      )}
    </MenuSubMenu>
  );
}
