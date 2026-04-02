import { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Zap, Plus, X } from 'lucide-react';
import { DashboardWidgetWrapper } from './widget-wrapper';
import { useDashboardStore, type ShortcutConfig } from '@/stores/dashboard-store';
import { useWidgetSettings } from '@/hooks/use-widget-settings';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { cn } from '@/lib/utils';
import { registry, filterAccessibleModules } from '@/lib/module-registry/registry';
import { useModuleAccessStore } from '@/stores/module-access-store';
import { useAuthStore } from '@/stores/auth-store';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import type { WidgetSettingDef } from '@/lib/module-registry/types';

// ═══════════════════════════════════════════════════════════════════════════
// QUICK SHORTCUTS WIDGET - User-chosen shortcuts for fast access
// Users can add/remove their own shortcuts in edit mode (max 6)
//
// Settings:
//   iconOnly (boolean) — show only icons (user toggle via widget settings)
//
// Container queries handle grid columns adapting to widget width:
//   @sm (320px) → 3 cols, @md (448px) → 4 cols
// ═══════════════════════════════════════════════════════════════════════════

const WIDGET_ID = 'quick-shortcuts';

const SETTINGS_DEFS: WidgetSettingDef[] = [
  { key: 'iconOnly', type: 'boolean', labelKey: 'dashboard.settings.iconOnly', defaultValue: false },
];

/** System pages (not modules) available as shortcuts */
const SYSTEM_SHORTCUTS: ShortcutConfig[] = [
  { path: '/profile', label: 'profile.title', icon: 'user' },
  { path: '/settings', label: 'settingsPage.title', icon: 'settings' },
];

/** All available pages: modules from registry + system pages */
function getAvailableShortcuts(canAccess: (key: string) => boolean): ShortcutConfig[] {
  const moduleShortcuts = filterAccessibleModules(registry.getAll(), canAccess).map((mod) => ({
    path: `/${mod.route.path}`,
    label: mod.translationKey,
    icon: mod.icon,
  }));
  return [...moduleShortcuts, ...SYSTEM_SHORTCUTS];
}

export function QuickShortcutsWidget() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { customShortcuts, editMode, addShortcut, removeShortcut } = useDashboardStore();
  const [showPicker, setShowPicker] = useState(false);
  const settings = useWidgetSettings(WIDGET_ID, SETTINGS_DEFS);
  const iconOnly = settings.iconOnly as boolean;
  const canAccess = useModuleAccessStore((s) => s.canAccess);
  const isGuest = useAuthStore((s) => s.user?.role === 'GUEST');

  const shortcuts = customShortcuts;

  const availableShortcuts = useMemo(() => {
    const all = getAvailableShortcuts(canAccess);
    if (!isGuest) return all;
    // Guests: only show modules with guestAccess: 'read' + system pages (except profile)
    const guestModuleKeys = new Set(
      registry.getAll().filter((m) => m.guestAccess === 'read').map((m) => `/${m.route.path}`),
    );
    return all.filter((s) => guestModuleKeys.has(s.path) || (SYSTEM_SHORTCUTS.some((sys) => sys.path === s.path) && s.path !== '/profile'));
  }, [canAccess, isGuest]);
  const addableShortcuts = availableShortcuts.filter(
    (s) => !shortcuts.some((c) => c.path === s.path)
  );

  const handleAdd = (shortcut: ShortcutConfig) => {
    addShortcut(shortcut);
    if (customShortcuts.length + 1 >= 6) setShowPicker(false);
  };

  return (
    <DashboardWidgetWrapper id={WIDGET_ID}>
      <div className="flex flex-col h-full gap-2">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" strokeWidth={1.5} />
            {!iconOnly && <span className="hidden @3xs:inline">{t('dashboard.widgets.quickShortcuts')}</span>}
          </h3>
          {editMode && shortcuts.length < 6 && (
            <button
              onClick={() => setShowPicker(!showPicker)}
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors',
                showPicker
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/30'
              )}
            >
              <Plus className="w-3 h-3" />
              {!iconOnly && <span className="hidden @xs:inline">{t('dashboard.addShortcut')}</span>}
            </button>
          )}
        </div>

        {/* Shortcut Picker (edit mode) */}
        {editMode && showPicker && addableShortcuts.length > 0 && (
          <div className="flex flex-wrap gap-1 p-2 rounded-lg bg-muted/20 border border-border/20 shrink-0">
            {addableShortcuts.map((shortcut) => (
              <button
                key={shortcut.path}
                onClick={() => handleAdd(shortcut)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-muted-foreground/70 hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                <span className="shrink-0">
                  <DynamicIcon name={shortcut.icon} className="w-3.5 h-3.5" />
                </span>
                {!iconOnly && <span className="truncate">{t(shortcut.label)}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Shortcut Grid — fills available space, rows stretch evenly */}
        <div className={cn(
          'flex-1 min-h-0 grid auto-rows-fr gap-1.5',
          iconOnly
            ? 'grid-cols-3 @xs:grid-cols-4 @sm:grid-cols-5 @md:grid-cols-6'
            : 'grid-cols-1 @xs:grid-cols-2 @sm:grid-cols-3'
        )}>
          {shortcuts.map((shortcut) => (
            <div key={shortcut.path} className="relative group/shortcut min-h-0">
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => !editMode && navigate(shortcut.path)}
                    className={cn(
                      'flex items-center rounded-lg w-full h-full',
                      'text-muted-foreground hover:text-foreground',
                      'bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border/30',
                      'transition-all duration-150',
                      iconOnly
                        ? 'justify-center p-2'
                        : 'gap-2 px-3 py-2',
                      editMode && 'cursor-default'
                    )}
                  >
                    <span className="shrink-0">
                      <DynamicIcon name={shortcut.icon} className="w-4 h-4" />
                    </span>
                    {!iconOnly && (
                      <span className="truncate text-xs font-medium">
                        {t(shortcut.label)}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                {iconOnly && (
                  <TooltipContent side="bottom">
                    {t(shortcut.label)}
                  </TooltipContent>
                )}
              </Tooltip>
              {editMode && (
                <button
                  onClick={() => removeShortcut(shortcut.path)}
                  className="absolute -top-1 -right-1 p-0.5 rounded-full bg-destructive/80 text-destructive-foreground opacity-0 group-hover/shortcut:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardWidgetWrapper>
  );
}
