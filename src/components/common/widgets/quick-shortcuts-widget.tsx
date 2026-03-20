import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Zap, Plus, X } from 'lucide-react';
import { DashboardWidgetWrapper } from './widget-wrapper';
import { useDashboardStore, type ShortcutConfig } from '@/stores/dashboard-store';
import { getIconComponent } from '@/lib/workspace-utils';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// QUICK SHORTCUTS WIDGET - User-chosen shortcuts for fast access
// Users can add/remove their own shortcuts in edit mode (max 6)
// ═══════════════════════════════════════════════════════════════════════════

/** All available pages the user can add as shortcuts */
const AVAILABLE_SHORTCUTS: ShortcutConfig[] = [
  { path: '/atlas/bacteriology', label: 'bacteriology.title', icon: 'bug' },
  { path: '/atlas/mycology', label: 'mycology.title', icon: 'leaf' },
  { path: '/lab/notes', label: 'notes.title', icon: 'sticky-note' },
  { path: '/lab/notifications', label: 'notifications.title', icon: 'bell' },
  { path: '/lab/quickshare', label: 'quickshare.title', icon: 'share-2' },
  { path: '/lab/contacts', label: 'contacts.title', icon: 'contact-round' },
  { path: '/lab/support', label: 'support.title', icon: 'life-buoy' },
  { path: '/profile', label: 'profile.title', icon: 'user' },
  { path: '/settings', label: 'settingsPage.title', icon: 'settings' },
];

export function QuickShortcutsWidget() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { customShortcuts, editMode, addShortcut, removeShortcut } = useDashboardStore();
  const [showPicker, setShowPicker] = React.useState(false);

  // Always use customShortcuts directly (initialized with defaults in store)
  const shortcuts = customShortcuts;

  // Available shortcuts not yet added
  const addableShortcuts = AVAILABLE_SHORTCUTS.filter(
    (s) => !shortcuts.some((c) => c.path === s.path)
  );

  const handleAdd = (shortcut: ShortcutConfig) => {
    addShortcut(shortcut);
    if (customShortcuts.length + 1 >= 6) setShowPicker(false);
  };

  return (
    <DashboardWidgetWrapper id="quick-shortcuts">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" strokeWidth={1.5} />
            {t('dashboard.widgets.quickShortcuts')}
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
              {t('dashboard.addShortcut')}
            </button>
          )}
        </div>

        {/* Shortcut Picker (shown in edit mode) */}
        {editMode && showPicker && addableShortcuts.length > 0 && (
          <div className="grid grid-cols-2 gap-1 p-2 rounded-lg bg-muted/20 border border-border/20">
            {addableShortcuts.map((shortcut) => (
              <button
                key={shortcut.path}
                onClick={() => handleAdd(shortcut)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-xs text-muted-foreground/70 hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                <span className="shrink-0">
                  {getIconComponent(shortcut.icon, 'w-3.5 h-3.5')}
                </span>
                <span className="truncate">{t(shortcut.label)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Shortcut Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.path} className="relative group/shortcut">
              <button
                onClick={() => !editMode && navigate(shortcut.path)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-left w-full',
                  'text-sm text-muted-foreground hover:text-foreground',
                  'bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border/30',
                  'transition-all duration-150',
                  editMode && 'cursor-default'
                )}
              >
                <span className="shrink-0">
                  {getIconComponent(shortcut.icon, 'w-4 h-4')}
                </span>
                <span className="truncate text-xs font-medium">{t(shortcut.label)}</span>
              </button>
              {/* Remove button in edit mode */}
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
