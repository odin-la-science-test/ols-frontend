'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Globe,
  Bell,
  BellOff,
  Palette,
  Check,
  Info,
  Maximize,
  Navigation,
  LayoutGrid,
  Eye,
  EyeOff,
  RotateCcw,
  Rows3,
  Minus,
  Plus,
  Keyboard,
  AlertTriangle,
  CornerDownLeft,
  X,
  Search,
  ChevronRight,
  Sparkles,
  UserCircle,
  Upload,
  Trash2,
  Copy,
  PanelBottom,
  PanelTop,
  PanelLeft,
  PanelRight,
  PanelBottomClose,
  AlignVerticalJustifyCenter,
  Columns2,
  Activity,
  Layers,
} from 'lucide-react';
import { Label } from '@/components/ui';
import { FormSection } from '@/components/modules/shared';
import { ModuleLayout } from '@/components/modules/layout';
import { ModuleHeader } from '@/components/modules/layout/module-header';
import { cn } from '@/lib/utils';
import { useThemeStore, useLanguageStore, LANGUAGES } from '@/stores';
import { useWorkspaceStore } from '@/stores';
import { useBottomPanelStore } from '@/stores/bottom-panel-store';
import type { BottomPanelAlignment } from '@/stores/bottom-panel-store';
import { useSidebarModeStore, type SidebarMode } from '@/stores/sidebar-mode-store';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { useActivityBarStore, type ActivityBarItemId, type ActivityBarPosition } from '@/stores';
import { useProfilesStore, PROFILE_ICONS, captureSnapshot, applySnapshot, type ProfileIconId } from '@/stores';
import {
  useKeybindingsStore,
  formatKeyCombo,
  type KeybindingActionId,
  type KeyCombo,
} from '@/stores/keybindings-store';
import { toast, useDensity } from '@/hooks';
import { getIconComponent } from '@/lib/workspace-utils.tsx';
import type { Density } from '@/stores/theme-store';
import {
  THEME_PRESETS,
} from '@/lib/theme-presets';

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE - Application settings
// VS Code-inspired layout: sidebar TOC + search + scrollable content
// ═══════════════════════════════════════════════════════════════════════════

// System pages use the theme's native --color-primary (no custom accent)

export function SettingsPage() {
  const { t } = useTranslation();
  const { themePreset, setThemePreset, density, setDensity, fontSize, setFontSize, iconOnlyButtons, setIconOnlyButtons, accentedUI, setAccentedUI } = useThemeStore();
  const { language, changeLanguage } = useLanguageStore();
  const { focusMode, toggleFocusMode, showBreadcrumbs, toggleBreadcrumbs, statusBarVisible, toggleStatusBar, menuBarVisible, toggleMenuBar } = useWorkspaceStore();
  const { visible: bottomPanelVisible, toggleVisible: toggleBottomPanel, alignment: panelAlignment, setAlignment: setPanelAlignment } = useBottomPanelStore();
  const { primaryMode: primarySidebarMode, secondaryMode: secondarySidebarMode, setPrimaryMode: setPrimarySidebarMode, setSecondaryMode: setSecondarySidebarMode } = useSidebarModeStore();
  const { splitActive, toggleSplit } = useEditorGroupsStore();
  const {
    activityBarVisible,
    toggleActivityBar,
    items: activityBarItems,
    setItemVisible,
    resetToDefaults: resetActivityBar,
    position: activityBarPosition,
    setPosition: setActivityBarPosition,
  } = useActivityBarStore();
  const {
    bindings,
    getEffectiveCombo,
    setKeybinding,
    resetKeybinding,
    resetAll: resetAllKeybindings,
    getConflicts,
    isCustomized,
    recordingActionId,
    startRecording,
    stopRecording,
  } = useKeybindingsStore();
  const {
    profiles,
    activeProfileId,
    createProfile,
    deleteProfile,
    setActiveProfileId,
    exportProfile,
    importProfile,
    resetToDefaults: resetProfiles,
  } = useProfilesStore();
  const [notifications, setNotifications] = React.useState(true);
  const conflicts = getConflicts();
  const d = useDensity();

  // ─── Profile UI state ───
  const [showCreateProfile, setShowCreateProfile] = React.useState(false);
  const [showImportProfile, setShowImportProfile] = React.useState(false);
  const [newProfileName, setNewProfileName] = React.useState('');
  const [newProfileDesc, setNewProfileDesc] = React.useState('');
  const [newProfileIcon, setNewProfileIcon] = React.useState<ProfileIconId>('microscope');
  const [importJson, setImportJson] = React.useState('');

  /** Handle creating a new profile */
  const handleCreateProfile = React.useCallback(() => {
    if (!newProfileName.trim()) return;
    const snapshot = captureSnapshot();
    createProfile(newProfileName.trim(), newProfileIcon, newProfileDesc.trim(), snapshot);
    toast({ title: t('profiles.created') });
    setShowCreateProfile(false);
    setNewProfileName('');
    setNewProfileDesc('');
    setNewProfileIcon('microscope');
  }, [newProfileName, newProfileIcon, newProfileDesc, createProfile, t]);

  /** Handle switching to a profile */
  const handleActivateProfile = React.useCallback((profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;
    applySnapshot(profile.snapshot);
    setActiveProfileId(profileId);
    const displayName = profile.isDefault ? t(profile.name) : profile.name;
    toast({ title: t('profiles.activated', { name: displayName }) });
  }, [profiles, setActiveProfileId, t]);

  /** Handle export */
  const handleExportProfile = React.useCallback(async (id: string) => {
    const json = exportProfile(id);
    if (json) {
      try {
        await navigator.clipboard.writeText(json);
        toast({ title: t('profiles.exported') });
      } catch {
        toast({ title: t('profiles.exportError') });
      }
    }
  }, [exportProfile, t]);

  /** Handle import */
  const handleImportProfile = React.useCallback(() => {
    if (!importJson.trim()) return;
    const id = importProfile(importJson.trim());
    if (id) {
      toast({ title: t('profiles.imported') });
      setShowImportProfile(false);
      setImportJson('');
    } else {
      toast({ title: t('profiles.importError') });
    }
  }, [importJson, importProfile, t]);

  const getLanguageLabel = (code: string) => {
    switch (code) {
      case 'fr':
        return t('settings.languages.french');
      case 'en':
        return t('settings.languages.english');
      default:
        return code.toUpperCase();
    }
  };

  const getLanguageFlag = (code: string) => {
    const lang = LANGUAGES.find((l) => l.code === code);
    return lang?.flag || '🌐';
  };

  // ─── Settings sections for TOC navigation ───
  const sections = [
    { id: 'appearance', icon: Palette, labelKey: 'settingsPage.appearance', keywords: ['theme', 'dark', 'light', 'thème', 'sombre', 'clair', 'preset', 'nord', 'dracula', 'solarized', 'monokai', 'github', 'accent', 'accentuation', 'couleur'] },
    { id: 'language', icon: Globe, labelKey: 'settingsPage.language', keywords: ['language', 'langue', 'french', 'english', 'français', 'anglais'] },
    { id: 'density', icon: Rows3, labelKey: 'settingsPage.densitySizing', keywords: ['density', 'font', 'size', 'compact', 'densité', 'taille', 'police', 'icon'] },
    { id: 'notifications', icon: Bell, labelKey: 'settingsPage.notifications', keywords: ['notification', 'alert', 'alerte'] },
    { id: 'focus', icon: Maximize, labelKey: 'settingsPage.focusMode', keywords: ['focus', 'distraction', 'zen'] },
    { id: 'navigation', icon: Navigation, labelKey: 'settingsPage.navigation', keywords: ['breadcrumb', 'navigation', 'fil', 'ariane'] },
    { id: 'status-bar', icon: PanelBottom, labelKey: 'settingsPage.statusBar', keywords: ['status', 'bar', 'barre', 'statut', 'network', 'réseau', 'online', 'offline'] },
    { id: 'menu-bar', icon: PanelTop, labelKey: 'settingsPage.menuBarSection', keywords: ['menu', 'bar', 'barre', 'menu bar', 'navigation', 'platform'] },
    { id: 'sidebar-mode', icon: Layers, labelKey: 'settingsPage.sidebarMode', keywords: ['sidebar', 'barre', 'latérale', 'overlay', 'dock', 'float', 'superposer', 'ancrer'] },
    { id: 'bottom-panel', icon: Activity, labelKey: 'settingsPage.bottomPanel', keywords: ['bottom', 'panel', 'panneau', 'activity', 'log', 'activité', 'journal'] },
    { id: 'split-view', icon: Columns2, labelKey: 'settingsPage.splitView', keywords: ['split', 'scinder', 'diviser', 'editor', 'group', 'side by side', 'côte à côte', 'multi'] },
    { id: 'activity-bar', icon: LayoutGrid, labelKey: 'settingsPage.activityBar', keywords: ['activity', 'bar', 'barre', 'activité', 'sidebar', 'explorer'] },
    { id: 'keybindings', icon: Keyboard, labelKey: 'settingsPage.keybindings', keywords: ['keyboard', 'shortcut', 'key', 'raccourci', 'clavier', 'binding'] },
    { id: 'profiles', icon: UserCircle, labelKey: 'settingsPage.profiles', keywords: ['profile', 'profil', 'workspace', 'save', 'export', 'import', 'sauvegarder', 'configuration'] },
    { id: 'about', icon: Info, labelKey: 'settingsPage.about', keywords: ['about', 'version', 'info', 'à propos'] },
  ] as const;

  const [activeTocId, setActiveTocId] = React.useState<string>('appearance');
  const [searchQuery, setSearchQuery] = React.useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Filter sections based on search
  const filteredSectionIds = React.useMemo(() => {
    if (!searchQuery.trim()) return sections.map((s) => s.id);
    const q = searchQuery.toLowerCase();
    return sections
      .filter((s) => {
        const label = t(s.labelKey).toLowerCase();
        return label.includes(q) || s.keywords.some((kw) => kw.includes(q));
      })
      .map((s) => s.id);
  }, [searchQuery, t]);

  // Observe which section is visible for active highlight
  React.useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveTocId(entry.target.id);
          }
        }
      },
      { root: container, rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [filteredSectionIds]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Ctrl+F focuses the search
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        const target = e.target as HTMLElement;
        // Only hijack if not already in an input
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <ModuleLayout>
      <ModuleHeader
        title={t('settingsPage.title')}
        icon={Settings}
        backTo="/"
        showFilters={false}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* ─── Sidebar TOC (desktop only) ─── */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 border-r border-border/30 bg-card/80">
          {/* Search */}
          <div className="p-3 border-b border-border/20">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('settingsPage.searchPlaceholder')}
                className="w-full pl-8 pr-8 py-1.5 text-xs rounded-md border border-border/40 bg-background/50 placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted/50"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Section links */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {sections.map((section) => {
              const SectionIcon = section.icon;
              const isActive = activeTocId === section.id;
              const isVisible = filteredSectionIds.includes(section.id);

              if (!isVisible && searchQuery) return null;

              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group text-left',
                    isActive
                      ? 'bg-muted/50 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  )}
                >
                  <div className={cn(
                    'w-0.5 h-4 rounded-full shrink-0 transition-all duration-150',
                    isActive
                      ? accentedUI ? 'bg-[var(--module-accent)]' : 'bg-foreground'
                      : 'bg-transparent group-hover:bg-muted-foreground/20'
                  )} />
                  <SectionIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="flex-1 truncate">{t(section.labelKey)}</span>
                  <ChevronRight className={cn(
                    'w-3 h-3 shrink-0 transition-all duration-150',
                    isActive ? 'opacity-60' : 'opacity-0 group-hover:opacity-30'
                  )} />
                </button>
              );
            })}
          </nav>

          {/* Search result count */}
          {searchQuery && (
            <div className="p-3 border-t border-border/20">
              <p className="text-[10px] text-muted-foreground/60 text-center">
                {filteredSectionIds.length} / {sections.length} {t('settingsPage.sectionsVisible')}
              </p>
            </div>
          )}
        </aside>

        {/* ─── Mobile search bar + horizontal TOC ─── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="lg:hidden border-b border-border/20 space-y-0">
            {/* Mobile search */}
            <div className="px-3 pt-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('settingsPage.searchPlaceholder')}
                  className="w-full pl-8 pr-8 py-1.5 text-xs rounded-md border border-border/40 bg-background/50 placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted/50"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Horizontal pills (mobile) */}
            <nav className="overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1 px-3 py-2 min-w-max">
                {sections.map((section) => {
                  if (!filteredSectionIds.includes(section.id) && searchQuery) return null;
                  const SectionIcon = section.icon;
                  const isActive = activeTocId === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all duration-150',
                        isActive
                          ? accentedUI
                            ? 'bg-muted/60 text-[var(--module-accent)]'
                            : 'bg-muted/60 text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                      )}
                    >
                      <SectionIcon className="w-3 h-3" />
                      {t(section.labelKey)}
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* ─── Main content (scrollable) ─── */}
          <div ref={contentRef} className="flex-1 overflow-y-auto">
            <div className={cn(
              'mx-auto pb-20 lg:pb-8 max-w-2xl',
              d.density === 'compact' ? 'p-3 md:p-5 space-y-3' : d.density === 'comfortable' ? 'p-6 md:p-10 space-y-8' : 'p-4 md:p-8 space-y-6'
            )}>

              {/* No results */}
              {searchQuery && filteredSectionIds.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Search className="w-8 h-8 mb-3 opacity-30" />
                  <p className="text-sm font-medium">{t('settingsPage.noResults')}</p>
                  <p className="text-xs mt-1 opacity-70">{t('settingsPage.noResultsDesc')}</p>
                </div>
              )}

              {/* ─── Appearance ─── */}
              {filteredSectionIds.includes('appearance') && (
      <FormSection
        id="appearance"
        title={t('settingsPage.appearance')}
        description={t('settingsPage.appearanceDesc')}
        icon={Palette}
        delay={0}
      >
        <div className="space-y-5">
          {/* Theme Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
              <Label className="text-xs font-medium text-muted-foreground">{t('settingsPage.themePreset')}</Label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {THEME_PRESETS.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  active={themePreset === preset.id}
                  onClick={() => setThemePreset(preset.id)}
                />
              ))}
            </div>
          </div>

          {/* Accented UI toggle */}
          <ToggleRow
            icon={<Palette className="w-4 h-4" />}
            label={t('settingsPage.accentedUI')}
            description={t('settingsPage.accentedUIDesc')}
            checked={accentedUI}
            onChange={() => setAccentedUI(!accentedUI)}
          />

        </div>
      </FormSection>
              )}

              {/* ─── Language ─── */}
              {filteredSectionIds.includes('language') && (
      <FormSection
        id="language"
        title={t('settingsPage.language')}
        description={t('settingsPage.languageDesc')}
        icon={Globe}
        delay={1}
      >
        <div className="space-y-1.5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150',
                'text-left',
                language === lang.code
                  ? 'bg-muted/40 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{getLanguageFlag(lang.code)}</span>
                <span className="text-sm font-medium">{getLanguageLabel(lang.code)}</span>
              </div>
              {language === lang.code && (
                <Check className={cn('w-4 h-4', accentedUI ? 'text-[var(--module-accent)]' : 'text-foreground/60')} />
              )}
            </button>
          ))}
        </div>
      </FormSection>
              )}

              {/* ─── Density & Sizing ─── */}
              {filteredSectionIds.includes('density') && (
      <FormSection
        id="density"
        title={t('settingsPage.densitySizing')}
        description={t('settingsPage.densitySizingDesc')}
        icon={Rows3}
        delay={2}
      >
        <div className="space-y-5">
          {/* Density Presets */}
          <div className="space-y-2.5">
            <Label className="text-xs font-medium text-muted-foreground">{t('settingsPage.density')}</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['compact', 'normal', 'comfortable'] as const).map((dOpt) => (
                <DensityOption
                  key={dOpt}
                  density={dOpt}
                  active={density === dOpt}
                  onClick={() => setDensity(dOpt)}
                />
              ))}
            </div>
          </div>

          {/* Font Size Slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">
                {t('settingsPage.fontSize')}
              </Label>
              <span className="text-xs font-mono text-muted-foreground">{fontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFontSize(fontSize - 1)}
                disabled={fontSize <= 12}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  fontSize <= 12 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-muted/30 text-muted-foreground hover:text-foreground'
                )}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min={12}
                  max={18}
                  step={1}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer bg-muted
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full 
                    [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-0"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground/50">12</span>
                  <span className="text-[10px] text-muted-foreground/50">14</span>
                  <span className="text-[10px] text-muted-foreground/50">16</span>
                  <span className="text-[10px] text-muted-foreground/50">18</span>
                </div>
              </div>
              <button
                onClick={() => setFontSize(fontSize + 1)}
                disabled={fontSize >= 18}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  fontSize >= 18 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-muted/30 text-muted-foreground hover:text-foreground'
                )}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-xs text-muted-foreground mb-2">{t('settingsPage.preview')}</p>
            <div className="space-y-1" style={{ fontSize: `${fontSize}px` }}>
              <p className="font-medium">{t('settingsPage.previewTitle')}</p>
              <p className="text-muted-foreground" style={{ fontSize: `${Math.max(fontSize - 2, 10)}px` }}>
                {t('settingsPage.previewDescription')}
              </p>
            </div>
          </div>

          {/* Icon-only buttons toggle */}
          <ToggleRow
            icon={<Rows3 className="w-4 h-4" />}
            label={t('settingsPage.iconOnlyButtons')}
            description={t('settingsPage.iconOnlyButtonsDesc')}
            checked={iconOnlyButtons}
            onChange={() => setIconOnlyButtons(!iconOnlyButtons)}
          />
        </div>
      </FormSection>
              )}

              {/* ─── Notifications ─── */}
              {filteredSectionIds.includes('notifications') && (
      <FormSection
        id="notifications"
        title={t('settingsPage.notifications')}
        description={t('settingsPage.notificationsDesc')}
        icon={Bell}
        delay={3}
      >
        <ToggleRow
          icon={notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          label={t('settingsPage.enableNotifications')}
          description={t('settingsPage.enableNotificationsDesc')}
          checked={notifications}
          onChange={() => {
            setNotifications(!notifications);
            toast({
              title: !notifications
                ? t('settingsPage.notificationsEnabled')
                : t('settingsPage.notificationsDisabled'),
            });
          }}
        />
      </FormSection>
              )}

              {/* ─── Focus Mode ─── */}
              {filteredSectionIds.includes('focus') && (
      <FormSection
        id="focus"
        title={t('settingsPage.focusMode')}
        description={t('settingsPage.focusModeDesc')}
        icon={Maximize}
        delay={4}
      >
        <ToggleRow
          icon={<Maximize className="w-4 h-4" />}
          label={t('settingsPage.enableFocusMode')}
          description={t('settingsPage.enableFocusModeDesc')}
          checked={focusMode}
          onChange={toggleFocusMode}
        />
      </FormSection>
              )}

              {/* ─── Navigation ─── */}
              {filteredSectionIds.includes('navigation') && (
      <FormSection
        id="navigation"
        title={t('settingsPage.navigation')}
        description={t('settingsPage.navigationDesc')}
        icon={Navigation}
        delay={5}
      >
        <ToggleRow
          icon={<Navigation className="w-4 h-4" />}
          label={t('settingsPage.showBreadcrumbs')}
          description={t('settingsPage.showBreadcrumbsDesc')}
          checked={showBreadcrumbs}
          onChange={toggleBreadcrumbs}
        />
      </FormSection>
              )}

              {/* ─── Status Bar ─── */}
              {filteredSectionIds.includes('status-bar') && (
      <FormSection
        id="status-bar"
        title={t('settingsPage.statusBar')}
        description={t('settingsPage.statusBarDesc')}
        icon={PanelBottom}
        delay={5.5}
      >
        <ToggleRow
          icon={<PanelBottom className="w-4 h-4" />}
          label={t('settingsPage.showStatusBar')}
          description={t('settingsPage.showStatusBarDesc')}
          checked={statusBarVisible}
          onChange={toggleStatusBar}
        />
      </FormSection>
              )}

              {/* ─── Menu Bar ─── */}
              {filteredSectionIds.includes('menu-bar') && (
      <FormSection
        id="menu-bar"
        title={t('settingsPage.menuBarSection')}
        description={t('settingsPage.menuBarSectionDesc')}
        icon={PanelTop}
        delay={5.6}
      >
        <ToggleRow
          icon={<PanelTop className="w-4 h-4" />}
          label={t('settingsPage.showMenuBar')}
          description={t('settingsPage.showMenuBarDesc')}
          checked={menuBarVisible}
          onChange={toggleMenuBar}
        />
      </FormSection>
              )}

              {/* ─── Sidebar Mode ─── */}
              {filteredSectionIds.includes('sidebar-mode') && (
      <FormSection
        id="sidebar-mode"
        title={t('settingsPage.sidebarMode')}
        description={t('settingsPage.sidebarModeDesc')}
        icon={Layers}
        delay={5.65}
      >
        {/* Primary sidebar mode */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <PanelLeft className="w-4 h-4 text-muted-foreground" />
            <Label className="text-xs font-medium text-muted-foreground">
              {t('settingsPage.primarySidebarMode')}
            </Label>
          </div>
          <p className="text-xs text-muted-foreground/60 mb-2">{t('settingsPage.primarySidebarModeDesc')}</p>
          <div className="flex gap-1">
            {([
              { value: 'dock' as SidebarMode, icon: PanelLeft, label: t('settingsPage.sidebarModeDock') },
              { value: 'overlay' as SidebarMode, icon: Layers, label: t('settingsPage.sidebarModeOverlay') },
            ]).map((opt) => {
              const Icon = opt.icon;
              const isSelected = primarySidebarMode === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setPrimarySidebarMode(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-150 min-w-[72px]',
                    isSelected
                      ? 'bg-muted/40 text-foreground'
                      : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{opt.label}</span>
                  {isSelected && <Check className={cn('w-3 h-3', accentedUI ? 'text-[var(--module-accent)]' : 'text-foreground/60')} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary sidebar mode */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <PanelRight className="w-4 h-4 text-muted-foreground" />
            <Label className="text-xs font-medium text-muted-foreground">
              {t('settingsPage.secondarySidebarMode')}
            </Label>
          </div>
          <p className="text-xs text-muted-foreground/60 mb-2">{t('settingsPage.secondarySidebarModeDesc')}</p>
          <div className="flex gap-1">
            {([
              { value: 'dock' as SidebarMode, icon: PanelRight, label: t('settingsPage.sidebarModeDock') },
              { value: 'overlay' as SidebarMode, icon: Layers, label: t('settingsPage.sidebarModeOverlay') },
            ]).map((opt) => {
              const Icon = opt.icon;
              const isSelected = secondarySidebarMode === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSecondarySidebarMode(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-150 min-w-[72px]',
                    isSelected
                      ? 'bg-muted/40 text-foreground'
                      : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{opt.label}</span>
                  {isSelected && <Check className={cn('w-3 h-3', accentedUI ? 'text-[var(--module-accent)]' : 'text-foreground/60')} />}
                </button>
              );
            })}
          </div>
        </div>
      </FormSection>
              )}

              {/* ─── Bottom Panel ─── */}
              {filteredSectionIds.includes('bottom-panel') && (
      <FormSection
        id="bottom-panel"
        title={t('settingsPage.bottomPanel')}
        description={t('settingsPage.bottomPanelDesc')}
        icon={Activity}
        delay={5.7}
      >
        <ToggleRow
          icon={<Activity className="w-4 h-4" />}
          label={t('settingsPage.showBottomPanel')}
          description={t('settingsPage.showBottomPanelDesc')}
          checked={bottomPanelVisible}
          onChange={toggleBottomPanel}
        />

        {/* Alignment selector */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-xs font-medium text-muted-foreground">
              {t('settingsPage.panelAlignment')}
            </Label>
          </div>
          <div className="flex gap-1">
            {([
              { value: 'center' as BottomPanelAlignment, icon: PanelBottomClose, label: t('bottomPanel.alignCenter') },
              { value: 'left' as BottomPanelAlignment, icon: PanelLeft, label: t('bottomPanel.alignLeft') },
              { value: 'right' as BottomPanelAlignment, icon: PanelRight, label: t('bottomPanel.alignRight') },
              { value: 'justify' as BottomPanelAlignment, icon: AlignVerticalJustifyCenter, label: t('bottomPanel.alignJustify') },
            ]).map((opt) => {
              const Icon = opt.icon;
              const isSelected = panelAlignment === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setPanelAlignment(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-150 min-w-[72px]',
                    isSelected
                      ? 'bg-muted/40 text-foreground'
                      : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{opt.label}</span>
                  {isSelected && <Check className={cn('w-3 h-3', accentedUI ? 'text-[var(--module-accent)]' : 'text-foreground/60')} />}
                </button>
              );
            })}
          </div>
        </div>
      </FormSection>
              )}

              {/* ─── Split View ─── */}
              {filteredSectionIds.includes('split-view') && (
      <FormSection
        id="split-view"
        title={t('settingsPage.splitView')}
        description={t('settingsPage.splitViewDesc')}
        icon={Columns2}
        delay={5.8}
      >
        <ToggleRow
          icon={<Columns2 className="w-4 h-4" />}
          label={t('settingsPage.enableSplitView')}
          description={t('settingsPage.enableSplitViewDesc')}
          checked={splitActive}
          onChange={toggleSplit}
        />
      </FormSection>
              )}

              {/* ─── Activity Bar ─── */}
              {filteredSectionIds.includes('activity-bar') && (
      <FormSection
        id="activity-bar"
        title={t('settingsPage.activityBar')}
        description={t('settingsPage.activityBarDesc')}
        icon={LayoutGrid}
        delay={6}
      >
        <div className="space-y-4">
          {/* Toggle visibility */}
          <ToggleRow
            icon={<LayoutGrid className="w-4 h-4" />}
            label={t('settingsPage.showActivityBar')}
            description={t('settingsPage.showActivityBarDesc')}
            checked={activityBarVisible}
            onChange={toggleActivityBar}
          />

          {/* Position selector */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-muted-foreground">
                {t('settingsPage.activityBarPosition')}
              </Label>
            </div>
            <div className="flex gap-1">
              {([
                { value: 'left' as ActivityBarPosition, icon: PanelLeft, label: t('activityBar.positionLeft') },
                { value: 'top' as ActivityBarPosition, icon: PanelTop, label: t('activityBar.positionTop') },
                { value: 'right' as ActivityBarPosition, icon: PanelRight, label: t('activityBar.positionRight') },
                { value: 'bottom' as ActivityBarPosition, icon: PanelBottom, label: t('activityBar.positionBottom') },
              ]).map((opt) => {
                const Icon = opt.icon;
                const isSelected = activityBarPosition === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setActivityBarPosition(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-150 min-w-[72px]',
                      isSelected
                        ? 'bg-muted/40 text-foreground'
                        : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{opt.label}</span>
                    {isSelected && <Check className={cn('w-3 h-3', accentedUI ? 'text-[var(--module-accent)]' : 'text-foreground/60')} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items visibility */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">
                {t('settingsPage.activityBarItems')}
              </Label>
              <button
                onClick={() => {
                  resetActivityBar();
                  toast({ title: t('settingsPage.activityBarReset') });
                }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                {t('settingsPage.resetDefaults')}
              </button>
            </div>
            {activityBarItems.map((item) => (
              <ActivityBarItemRow
                key={item.id}
                id={item.id}
                icon={item.icon}
                visible={item.visible}
                onToggle={() => setItemVisible(item.id, !item.visible)}
              />
            ))}
          </div>
        </div>
      </FormSection>
              )}

              {/* ─── Keyboard Shortcuts ─── */}
              {filteredSectionIds.includes('keybindings') && (
      <FormSection
        id="keybindings"
        title={t('settingsPage.keybindings')}
        description={t('settingsPage.keybindingsDesc')}
        icon={Keyboard}
        delay={7}
      >
        <div className="space-y-4">
          {/* Conflicts warning */}
          {conflicts.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg border border-warning/40 bg-warning/5">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium text-warning">{t('settingsPage.keybindingsConflict')}</p>
                <p className="text-muted-foreground mt-0.5">{t('settingsPage.keybindingsConflictDesc')}</p>
              </div>
            </div>
          )}

          {/* Category: Navigation */}
          <KeybindingCategory
            label={t('settingsPage.keybindingsCatNavigation')}
            bindings={bindings.filter((b) => b.category === 'navigation')}
            getEffectiveCombo={getEffectiveCombo}
            isCustomized={isCustomized}
            recordingActionId={recordingActionId}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onSetKeybinding={setKeybinding}
            onResetKeybinding={resetKeybinding}
            conflicts={conflicts}
          />

          {/* Category: Layout */}
          <KeybindingCategory
            label={t('settingsPage.keybindingsCatLayout')}
            bindings={bindings.filter((b) => b.category === 'layout')}
            getEffectiveCombo={getEffectiveCombo}
            isCustomized={isCustomized}
            recordingActionId={recordingActionId}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onSetKeybinding={setKeybinding}
            onResetKeybinding={resetKeybinding}
            conflicts={conflicts}
          />

          {/* Category: Tabs */}
          <KeybindingCategory
            label={t('settingsPage.keybindingsCatTabs')}
            bindings={bindings.filter((b) => b.category === 'tabs')}
            getEffectiveCombo={getEffectiveCombo}
            isCustomized={isCustomized}
            recordingActionId={recordingActionId}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onSetKeybinding={setKeybinding}
            onResetKeybinding={resetKeybinding}
            conflicts={conflicts}
          />

          {/* Reset all button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                resetAllKeybindings();
                toast({ title: t('settingsPage.keybindingsReset') });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border border-border/40"
            >
              <RotateCcw className="w-3 h-3" />
              {t('settingsPage.keybindingsResetAll')}
            </button>
          </div>
        </div>
      </FormSection>
              )}

              {/* ─── Profiles ─── */}
              {filteredSectionIds.includes('profiles') && (
      <FormSection
        id="profiles"
        title={t('settingsPage.profiles')}
        description={t('settingsPage.profilesDesc')}
        icon={UserCircle}
        delay={8}
      >
        <div className="space-y-4">
          {/* Active profile indicator + action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {profiles.filter((p) => !p.isDefault).length} {t('settingsPage.profiles').toLowerCase()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowImportProfile(true)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <Upload className="w-3 h-3" />
                {t('profiles.import')}
              </button>
              <button
                onClick={() => setShowCreateProfile(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-foreground/10 hover:bg-foreground/15 text-foreground transition-colors"
              >
                <Plus className="w-3 h-3" />
                {t('profiles.create')}
              </button>
            </div>
          </div>

          {/* Create profile form */}
          {showCreateProfile && (
            <div className="p-4 rounded-lg border border-border/40 bg-card/50 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{t('profiles.createTitle')}</p>
                <button
                  onClick={() => setShowCreateProfile(false)}
                  className="p-1 rounded hover:bg-muted/50 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{t('profiles.createDesc')}</p>

              {/* Name input */}
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder={t('profiles.namePlaceholder')}
                className="w-full px-3 py-2 text-sm rounded-md border border-border/40 bg-background/50 placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all"
                autoFocus
              />

              {/* Description input */}
              <input
                type="text"
                value={newProfileDesc}
                onChange={(e) => setNewProfileDesc(e.target.value)}
                placeholder={t('profiles.descriptionPlaceholder')}
                className="w-full px-3 py-2 text-sm rounded-md border border-border/40 bg-background/50 placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all"
              />

              {/* Icon picker */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">{t('profiles.chooseIcon')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {PROFILE_ICONS.map((iconId) => (
                    <button
                      key={iconId}
                      onClick={() => setNewProfileIcon(iconId)}
                      className={cn(
                        'p-2 rounded-lg border transition-all',
                        newProfileIcon === iconId
                          ? accentedUI
                            ? 'border-[var(--module-accent)]/50 bg-[var(--module-accent-subtle)] ring-1 ring-[var(--module-accent)]/20'
                            : 'border-foreground/30 bg-foreground/5 ring-1 ring-foreground/10'
                          : 'border-border/30 hover:border-border/50 hover:bg-muted/30'
                      )}
                    >
                      {getIconComponent(iconId, 'h-4 w-4')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowCreateProfile(false)}
                  className="px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  {t('profiles.cancel')}
                </button>
                <button
                  onClick={handleCreateProfile}
                  disabled={!newProfileName.trim()}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    newProfileName.trim()
                      ? 'bg-foreground/10 hover:bg-foreground/15 text-foreground'
                      : 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground'
                  )}
                >
                  {t('profiles.save')}
                </button>
              </div>
            </div>
          )}

          {/* Import profile form */}
          {showImportProfile && (
            <div className="p-4 rounded-lg border border-border/40 bg-card/50 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{t('profiles.importTitle')}</p>
                <button
                  onClick={() => { setShowImportProfile(false); setImportJson(''); }}
                  className="p-1 rounded hover:bg-muted/50 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{t('profiles.importDesc')}</p>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder={t('profiles.importPlaceholder')}
                rows={5}
                className="w-full px-3 py-2 text-xs font-mono rounded-md border border-border/40 bg-background/50 placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => { setShowImportProfile(false); setImportJson(''); }}
                  className="px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  {t('profiles.cancel')}
                </button>
                <button
                  onClick={handleImportProfile}
                  disabled={!importJson.trim()}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    importJson.trim()
                      ? 'bg-foreground/10 hover:bg-foreground/15 text-foreground'
                      : 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground'
                  )}
                >
                  {t('profiles.import')}
                </button>
              </div>
            </div>
          )}

          {/* Profiles list */}
          <div className="space-y-2">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isActive={activeProfileId === profile.id}
                onActivate={() => handleActivateProfile(profile.id)}
                onExport={() => handleExportProfile(profile.id)}
                onDelete={() => {
                  deleteProfile(profile.id);
                  toast({ title: t('profiles.deleted') });
                }}
              />
            ))}
          </div>

          {/* Reset all profiles */}
          {profiles.filter((p) => !p.isDefault).length > 0 && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  resetProfiles();
                  toast({ title: t('profiles.resetDone') });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border border-border/40"
              >
                <RotateCcw className="w-3 h-3" />
                {t('profiles.resetAll')}
              </button>
            </div>
          )}
        </div>
      </FormSection>
              )}

              {/* ─── About ─── */}
              {filteredSectionIds.includes('about') && (
      <FormSection
        id="about"
        title={t('settingsPage.about')}
        icon={Info}
        delay={8}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('settingsPage.version')}</span>
            <span className="font-mono text-xs text-foreground">0.1.0-alpha</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('settingsPage.platform')}</span>
            <span className="text-xs text-foreground">Odin La Science</span>
          </div>
        </div>
      </FormSection>
              )}

            </div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}

// ─── Sub-components ───

// ─── Preset Card ───

interface PresetCardProps {
  preset: import('@/lib/theme-presets').ThemePreset;
  active: boolean;
  onClick: () => void;
}

function PresetCard({ preset, active, onClick }: PresetCardProps) {
  const { t } = useTranslation();
  const accentedUI = useThemeStore((s) => s.accentedUI);
  const { bg, surface, accent, text } = preset.preview;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col rounded-lg border overflow-hidden transition-all duration-150 group',
        active
          ? accentedUI
            ? 'border-[var(--module-accent)]/50 ring-1 ring-[var(--module-accent)]/30'
            : 'border-foreground/30 ring-1 ring-foreground/10'
          : 'border-border/30 hover:border-border/50'
      )}
    >
      {/* Color preview mini-window */}
      <div
        className="w-full h-16 p-2 flex flex-col gap-1"
        style={{ backgroundColor: bg }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
            <div className="w-1.5 h-1.5 rounded-full opacity-40" style={{ backgroundColor: text }} />
            <div className="w-1.5 h-1.5 rounded-full opacity-40" style={{ backgroundColor: text }} />
          </div>
        </div>
        {/* Fake content */}
        <div className="flex gap-1 flex-1">
          {/* Sidebar */}
          <div className="w-4 rounded-sm flex flex-col gap-0.5 p-0.5" style={{ backgroundColor: surface }}>
            <div className="w-full h-0.5 rounded-full opacity-40" style={{ backgroundColor: text }} />
            <div className="w-full h-0.5 rounded-full opacity-25" style={{ backgroundColor: text }} />
            <div className="w-full h-0.5 rounded-full opacity-25" style={{ backgroundColor: text }} />
          </div>
          {/* Main */}
          <div className="flex-1 rounded-sm p-1" style={{ backgroundColor: surface }}>
            <div className="w-3/4 h-0.5 rounded-full mb-0.5" style={{ backgroundColor: accent }} />
            <div className="w-full h-0.5 rounded-full opacity-20" style={{ backgroundColor: text }} />
            <div className="w-2/3 h-0.5 rounded-full opacity-15 mt-0.5" style={{ backgroundColor: text }} />
          </div>
        </div>
      </div>

      {/* Label */}
      <div className={cn(
        'px-2 py-1.5 flex items-center justify-between',
        active ? 'bg-card' : 'bg-card'
      )}>
        <span className="text-[11px] font-medium truncate">{t(preset.labelKey)}</span>
        {active && <Check className={cn('w-3 h-3 shrink-0', accentedUI ? 'text-[var(--module-accent)]' : 'text-foreground/60')} />}
      </div>
    </button>
  );
}

// ─── Density Option ───

const DENSITY_ICONS: Record<Density, React.ReactNode> = {
  compact: (
    <div className="flex flex-col gap-0.5">
      <div className="w-6 h-[3px] rounded-full bg-current" />
      <div className="w-4 h-[3px] rounded-full bg-current opacity-60" />
      <div className="w-5 h-[3px] rounded-full bg-current opacity-40" />
    </div>
  ),
  normal: (
    <div className="flex flex-col gap-1">
      <div className="w-6 h-[3px] rounded-full bg-current" />
      <div className="w-4 h-[3px] rounded-full bg-current opacity-60" />
      <div className="w-5 h-[3px] rounded-full bg-current opacity-40" />
    </div>
  ),
  comfortable: (
    <div className="flex flex-col gap-1.5">
      <div className="w-6 h-[3px] rounded-full bg-current" />
      <div className="w-4 h-[3px] rounded-full bg-current opacity-60" />
      <div className="w-5 h-[3px] rounded-full bg-current opacity-40" />
    </div>
  ),
};

interface DensityOptionProps {
  density: Density;
  active: boolean;
  onClick: () => void;
}

function DensityOption({ density, active, onClick }: DensityOptionProps) {
  const { t } = useTranslation();
  const accentedUI = useThemeStore((s) => s.accentedUI);
  const labels: Record<Density, string> = {
    compact: t('settingsPage.densityCompact'),
    normal: t('settingsPage.densityNormal'),
    comfortable: t('settingsPage.densityComfortable'),
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-150',
        active
          ? 'bg-muted/40 text-foreground'
          : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
      )}
    >
      {DENSITY_ICONS[density]}
      <span className="text-xs font-medium">{labels[density]}</span>
      {active && <Check className={cn('w-3 h-3', accentedUI ? 'text-[var(--module-accent)]' : 'text-foreground/60')} />}
    </button>
  );
}

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleRow({ icon, label, description, checked, onChange }: ToggleRowProps) {
  const accentedUI = useThemeStore((s) => s.accentedUI);
  return (
    <button
      onClick={onChange}
      className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-all duration-150 text-left"
    >
      <div className={cn('shrink-0', checked ? 'text-foreground' : 'text-muted-foreground')}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {/* Toggle */}
      <div
        className={cn(
          'relative w-9 h-5 rounded-full shrink-0 transition-colors duration-200',
          checked
            ? accentedUI ? 'bg-[var(--module-accent)]' : 'bg-foreground'
            : 'bg-border'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-transform duration-200',
            checked ? 'translate-x-4 bg-background' : 'translate-x-0.5 bg-background border border-border'
          )}
        />
      </div>
    </button>
  );
}

// ─── Activity Bar Item Row ───

const ACTIVITY_BAR_LABEL_KEYS: Record<string, string> = {
  explorer: 'activityBar.explorer',
  notes: 'notes.title',
  notifications: 'notifications.title',
  settings: 'settings.title',
};

interface ActivityBarItemRowProps {
  id: ActivityBarItemId;
  icon: string;
  visible: boolean;
  onToggle: () => void;
}

function ActivityBarItemRow({ id, icon, visible, onToggle }: ActivityBarItemRowProps) {
  const { t } = useTranslation();
  const label = t(ACTIVITY_BAR_LABEL_KEYS[id] || id);

  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left',
        visible
          ? 'border-border/40 bg-card hover:border-border/60'
          : 'border-border/20 bg-card/50 opacity-60 hover:opacity-80'
      )}
    >
      <span className={cn('shrink-0', visible ? 'text-foreground' : 'text-muted-foreground')}>
        {getIconComponent(icon, 'h-4 w-4')}
      </span>
      <span className="flex-1 text-sm font-medium truncate">{label}</span>
      <span className={cn('shrink-0', visible ? 'text-foreground/60' : 'text-muted-foreground')}>
        {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </span>
    </button>
  );
}

// ─── Keybinding Components ───

interface KeybindingCategoryProps {
  label: string;
  bindings: import('@/stores/keybindings-store').KeybindingEntry[];
  getEffectiveCombo: (id: KeybindingActionId) => KeyCombo;
  isCustomized: (id: KeybindingActionId) => boolean;
  recordingActionId: KeybindingActionId | null;
  onStartRecording: (id: KeybindingActionId) => void;
  onStopRecording: () => void;
  onSetKeybinding: (id: KeybindingActionId, combo: KeyCombo) => void;
  onResetKeybinding: (id: KeybindingActionId) => void;
  conflicts: import('@/stores/keybindings-store').KeybindingConflict[];
}

function KeybindingCategory({
  label,
  bindings,
  getEffectiveCombo,
  isCustomized,
  recordingActionId,
  onStartRecording,
  onStopRecording,
  onSetKeybinding,
  onResetKeybinding,
  conflicts,
}: KeybindingCategoryProps) {
  if (bindings.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {bindings.map((binding) => (
        <KeybindingRow
          key={binding.id}
          binding={binding}
          effectiveCombo={getEffectiveCombo(binding.id)}
          customized={isCustomized(binding.id)}
          isRecording={recordingActionId === binding.id}
          onStartRecording={() => onStartRecording(binding.id)}
          onStopRecording={onStopRecording}
          onSetKeybinding={(combo) => onSetKeybinding(binding.id, combo)}
          onReset={() => onResetKeybinding(binding.id)}
          hasConflict={conflicts.some(
            (c) => c.actionId === binding.id || c.conflictsWith === binding.id
          )}
        />
      ))}
    </div>
  );
}

interface KeybindingRowProps {
  binding: import('@/stores/keybindings-store').KeybindingEntry;
  effectiveCombo: KeyCombo;
  customized: boolean;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSetKeybinding: (combo: KeyCombo) => void;
  onReset: () => void;
  hasConflict: boolean;
}

function KeybindingRow({
  binding,
  effectiveCombo,
  customized,
  isRecording,
  onStartRecording,
  onStopRecording,
  onSetKeybinding,
  onReset,
  hasConflict,
}: KeybindingRowProps) {
  const { t } = useTranslation();
  const accentedUI = useThemeStore((s) => s.accentedUI);

  // Get the label — for goToTab actions, append the tab number
  const getLabel = () => {
    if (binding.id.startsWith('goToTab')) {
      const num = binding.id.replace('goToTab', '');
      return `${t(binding.labelKey)} ${num}`;
    }
    return t(binding.labelKey);
  };

  // Handle key recording
  React.useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      // Escape cancels recording
      if (event.key === 'Escape') {
        onStopRecording();
        return;
      }

      // Ignore standalone modifier presses
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) {
        return;
      }

      const combo: KeyCombo = {
        key: event.key.toLowerCase(),
        ctrlKey: event.ctrlKey || event.metaKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
      };

      // Require at least one modifier
      if (!combo.ctrlKey && !combo.altKey) {
        return;
      }

      onSetKeybinding(combo);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isRecording, onStopRecording, onSetKeybinding]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all',
        isRecording
          ? accentedUI
            ? 'border-[var(--module-accent)]/40 bg-[var(--module-accent-subtle)] ring-1 ring-[var(--module-accent)]/20'
            : 'border-foreground/30 bg-foreground/5 ring-1 ring-foreground/10'
          : hasConflict
            ? 'border-warning/40 bg-warning/5'
            : 'border-border/40 bg-card hover:border-border/60'
      )}
    >
      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{getLabel()}</p>
      </div>

      {/* Conflict indicator */}
      {hasConflict && !isRecording && (
        <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
      )}

      {/* Customized indicator */}
      {customized && !isRecording && !hasConflict && (
        <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', accentedUI ? 'bg-[var(--module-accent)]/60' : 'bg-foreground/40')} />
      )}

      {/* Keybinding button / recorder */}
      {isRecording ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-foreground/20 bg-foreground/5 animate-pulse">
            <CornerDownLeft className="w-3 h-3 text-foreground/70" />
            <span className="text-xs text-foreground/70 font-medium whitespace-nowrap">
              {t('settingsPage.keybindingsRecording')}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onStopRecording(); }}
            className="p-1 rounded hover:bg-muted/50 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <button
            onClick={onStartRecording}
            className={cn(
              'px-2.5 py-1 rounded-md border text-xs font-mono transition-all',
              'hover:border-foreground/20 hover:bg-foreground/5',
              customized
                ? accentedUI
                  ? 'border-[var(--module-accent)]/40 bg-[var(--module-accent-subtle)] text-[var(--module-accent)]'
                  : 'border-foreground/20 bg-foreground/5 text-foreground'
                : 'border-border/40 bg-muted/30 text-muted-foreground'
            )}
            title={t('settingsPage.keybindingsClickToRecord')}
          >
            {formatKeyCombo(effectiveCombo)}
          </button>
          {customized && (
            <button
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              className="p-1 rounded hover:bg-muted/50 transition-colors"
              title={t('settingsPage.resetDefaults')}
            >
              <RotateCcw className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Profile Card ───

interface ProfileCardProps {
  profile: import('@/stores/profiles-store').WorkspaceProfile;
  isActive: boolean;
  onActivate: () => void;
  onExport: () => void;
  onDelete: () => void;
}

function ProfileCard({ profile, isActive, onActivate, onExport, onDelete }: ProfileCardProps) {
  const { t } = useTranslation();
  const accentedUI = useThemeStore((s) => s.accentedUI);

  const displayName = profile.isDefault ? t(profile.name) : profile.name;
  const displayDesc = profile.isDefault ? t(profile.description) : profile.description;

  // Summary of what the profile includes
  const presetLabel = profile.snapshot.themePreset;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-all',
        isActive
          ? accentedUI
            ? 'border-[var(--module-accent)]/40 bg-[var(--module-accent-subtle)]'
            : 'border-foreground/20 bg-foreground/5'
          : 'border-border/40 bg-card hover:border-border/60'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'shrink-0 p-2 rounded-lg',
        isActive ? 'bg-foreground/10' : 'bg-muted/30'
      )}>
        {getIconComponent(profile.icon, 'h-4 w-4')}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{displayName}</span>
          {isActive && (
            <span className={cn(
              'px-1.5 py-0.5 text-[10px] font-medium rounded-full',
              accentedUI
                ? 'bg-[var(--module-accent)]/15 text-[var(--module-accent)]'
                : 'bg-foreground/10 text-foreground/70'
            )}>
              {t('profiles.active')}
            </span>
          )}
        </div>
        {displayDesc && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{displayDesc}</p>
        )}

        {/* Snapshot info */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
            <Palette className="w-2.5 h-2.5" />
            {presetLabel}
          </span>
          <span className="text-[10px] text-muted-foreground/40">•</span>
          <span className="text-[10px] text-muted-foreground/60">
            {profile.snapshot.density}
          </span>
          <span className="text-[10px] text-muted-foreground/40">•</span>
          <span className="text-[10px] text-muted-foreground/60">
            {profile.snapshot.fontSize}px
          </span>
          {(profile.snapshot.openTabs?.length ?? 0) > 0 && (
            <>
              <span className="text-[10px] text-muted-foreground/40">•</span>
              <span className="text-[10px] text-muted-foreground/60">
                {profile.snapshot.openTabs.length} {t('tabs.title', 'tabs')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {!isActive && (
          <button
            onClick={onActivate}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title={t('profiles.activate')}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onExport}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title={t('profiles.export')}
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        {!profile.isDefault && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title={t('profiles.delete')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
