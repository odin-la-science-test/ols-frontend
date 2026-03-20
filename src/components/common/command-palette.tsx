'use client';

import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Moon,
  Sun,
  Languages,
  Home,
  BookOpen,
  FlaskConical,
  Pin,
  Clock,
  X,
  PanelTop,
  PanelLeft,
  PanelRight,
  PanelBottom,
  LayoutGrid,
  Maximize,
  Minimize2,
  Keyboard,
  LayoutDashboard,
  Loader2,
  ChevronRight,
  Microscope,
  Flame,
  Users,
  NotebookPen,
  User,
  Settings,
  UserCircle,
  SlidersHorizontal,
  Columns2,
  Activity,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useCommandPaletteStore,
  useWorkspaceStore,
  useThemeStore,
  useLanguageStore,
  useActivityBarStore,
  useProfilesStore,
  applySnapshot,
} from '@/stores';
import { useKeybindingsStore, formatKeyCombo } from '@/stores/keybindings-store';
import { useBottomPanelStore } from '@/stores/bottom-panel-store';
import { useSidebarModeStore } from '@/stores/sidebar-mode-store';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useModules, useGlobalSearch, parseSearchInput, type AppModuleDTO, type SearchResult, type SearchResultType } from '@/hooks';
import { toast } from '@/hooks';

import { getIconComponent } from '@/lib/workspace-utils.tsx';

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND PALETTE - Ctrl+K pour recherche rapide + recherche fédérée
// Desktop only - Inspiré de VS Code, Linear, Notion
// Prefixes: > commands, @ entities, # tags
// ═══════════════════════════════════════════════════════════════════════════

// ─── Search result type icon mapping ───
const RESULT_TYPE_ICONS: Record<SearchResultType, React.ReactNode> = {
  bacterium: <Microscope className="h-4 w-4" />,
  fungus: <Flame className="h-4 w-4" />,
  contact: <Users className="h-4 w-4" />,
  note: <NotebookPen className="h-4 w-4" />,
};

interface CommandItemProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
  keywords?: string[];
}

function CommandItem({ icon, children, shortcut, onSelect, keywords }: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      keywords={keywords}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
        'text-sm text-foreground/90',
        'data-[selected=true]:bg-muted data-[selected=true]:text-foreground',
        'transition-colors duration-150'
      )}
    >
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-muted-foreground bg-muted/50 rounded">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}

function CommandGroup({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
    >
      {children}
    </Command.Group>
  );
}

// ─── Search Result Item ───
function SearchResultItem({ result, onSelect }: { result: SearchResult; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      value={`${result.type}-${result.id}-${result.title}`}
      keywords={[result.title, result.subtitle || '', ...(result.tags || [])]}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
        'text-sm text-foreground/90',
        'data-[selected=true]:bg-muted data-[selected=true]:text-foreground',
        'transition-colors duration-150'
      )}
    >
      <span className="text-muted-foreground">
        {RESULT_TYPE_ICONS[result.type]}
      </span>
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">{result.title}</div>
        {result.subtitle && (
          <div className="truncate text-xs text-muted-foreground mt-0.5">{result.subtitle}</div>
        )}
      </div>
      {result.tags && result.tags.length > 0 && (
        <div className="hidden sm:flex items-center gap-1">
          {result.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-[10px] bg-muted/50 text-muted-foreground rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
    </Command.Item>
  );
}

// ─── Mode Hint Badges ───
function ModeHints({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border/30">
      <span className="text-[10px] text-muted-foreground/60">{t('commandPalette.hints.label')}</span>
      <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground bg-muted/40 rounded font-mono">
        {t('commandPalette.hints.commands')}
      </span>
      <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground bg-muted/40 rounded font-mono">
        {t('commandPalette.hints.entities')}
      </span>
      <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground bg-muted/40 rounded font-mono">
        {t('commandPalette.hints.tags')}
      </span>
    </div>
  );
}

export function CommandPalette() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isOpen, close } = useCommandPaletteStore();
  const { recentModules, pinnedModules, addRecent, tabBarVisible, toggleTabBar, globalSidebarOpen, toggleGlobalSidebar, focusMode, toggleFocusMode, statusBarVisible, toggleStatusBar, menuBarVisible, toggleMenuBar } = useWorkspaceStore();
  const { activityBarVisible, toggleActivityBar, togglePanel: toggleActivityPanel, setPosition: setActivityBarPosition } = useActivityBarStore();
  const activityPanelZone = usePanelRegistryStore((s) => s.zones['activity-panel'] ?? { stack: [], activeTab: null, viewMode: 'tabs' as const, isOpen: false });
  const activeActivityPanel = activityPanelZone.isOpen ? activityPanelZone.activeTab : null;
  const { getEffectiveCombo } = useKeybindingsStore();
  const { theme, toggleTheme } = useThemeStore();
  const { language, changeLanguage } = useLanguageStore();
  const { profiles, activeProfileId, setActiveProfileId } = useProfilesStore();
  
  const { data: modules = [] } = useModules();
  
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [search, setSearch] = React.useState('');

  // Parse search input for prefix modes
  const parsed = React.useMemo(() => parseSearchInput(search), [search]);

  // Federated search — only fires in 'entity', 'tag', or 'mixed' mode with enough characters
  const entityQuery = (parsed.mode === 'entity' || parsed.mode === 'tag' || parsed.mode === 'mixed') ? parsed.query : '';
  const searchMode = (parsed.mode === 'entity' || parsed.mode === 'tag') ? parsed.mode : 'entity';
  const { data: searchResults, isFetching: isSearching } = useGlobalSearch(entityQuery, searchMode);

  // Does the search have any entity results?
  const hasEntityResults = (searchResults?.total ?? 0) > 0;

  // Search result type labels
  const resultTypeLabels: Record<SearchResultType, string> = React.useMemo(() => ({
    bacterium: t('commandPalette.resultTypes.bacterium'),
    fungus: t('commandPalette.resultTypes.fungus'),
    contact: t('commandPalette.resultTypes.contact'),
    note: t('commandPalette.resultTypes.note'),
  }), [t]);

  const getLanguageLabel = React.useCallback(
    (code: string) => {
      switch (code) {
        case 'fr':
          return t('settings.languages.french');
        case 'en':
          return t('settings.languages.english');
        default:
          return code.toUpperCase();
      }
    },
    [t]
  );

  const keywordHome = [
    t('commandPalette.keywords.home'),
    t('commandPalette.keywords.homeAlt'),
  ];
  const keywordAtlas = [
    t('commandPalette.keywords.atlas'),
    t('commandPalette.keywords.munin'),
    t('commandPalette.keywords.knowledge'),
    t('commandPalette.keywords.base'),
  ];
  const keywordLab = [
    t('commandPalette.keywords.lab'),
    t('commandPalette.keywords.hugin'),
    t('commandPalette.keywords.tools'),
  ];
  const keywordTheme = [
    t('commandPalette.keywords.theme'),
    t('commandPalette.keywords.dark'),
    t('commandPalette.keywords.light'),
    t('commandPalette.keywords.mode'),
  ];
  const keywordLanguage = [
    t('commandPalette.keywords.language'),
    t('commandPalette.keywords.french'),
    t('commandPalette.keywords.english'),
  ];
  const keywordTabs = [
    t('commandPalette.keywords.tabs'),
    t('commandPalette.keywords.hide'),
    t('commandPalette.keywords.show'),
    t('commandPalette.keywords.toggle'),
  ];
  const keywordSidebar = [
    t('commandPalette.keywords.sidebar'),
    t('commandPalette.keywords.hide'),
    t('commandPalette.keywords.show'),
    t('commandPalette.keywords.toggle'),
  ];
  const keywordActivityBar = [
    t('commandPalette.keywords.activityBar'),
    t('commandPalette.keywords.hide'),
    t('commandPalette.keywords.show'),
    t('commandPalette.keywords.toggle'),
  ];
  const keywordStatusBar = [
    t('commandPalette.keywords.statusBar'),
    t('commandPalette.keywords.hide'),
    t('commandPalette.keywords.show'),
    t('commandPalette.keywords.toggle'),
  ];
  const keywordMenuBar = [
    t('commandPalette.keywords.menuBar'),
    t('commandPalette.keywords.hide'),
    t('commandPalette.keywords.show'),
    t('commandPalette.keywords.toggle'),
  ];
  const keywordFiltersPanel = [
    t('commandPalette.keywords.filters'),
    t('commandPalette.keywords.sidebar'),
    t('commandPalette.keywords.toggle'),
  ];
  const keywordNotesPanel = [
    'notes',
    t('commandPalette.keywords.sidebar'),
    t('commandPalette.keywords.toggle'),
  ];
  const keywordFocus = [
    t('commandPalette.keywords.focus'),
    t('commandPalette.keywords.zen'),
    t('commandPalette.keywords.fullscreen'),
    t('commandPalette.keywords.hide'),
    t('commandPalette.keywords.toggle'),
  ];
  const keywordKeybindings = [
    t('commandPalette.keywords.keybindings'),
    t('commandPalette.keywords.shortcuts'),
    t('commandPalette.keywords.keyboard'),
  ];
  const keywordProfile = [
    t('commandPalette.keywords.profile'),
    t('commandPalette.keywords.account'),
    t('commandPalette.keywords.avatar'),
    t('commandPalette.keywords.password'),
  ];
  const keywordSettings = [
    t('commandPalette.keywords.settings'),
    t('commandPalette.keywords.preferences'),
    t('commandPalette.keywords.config'),
  ];

  // Handle profile switch
  const handleSwitchProfile = React.useCallback((profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;
    applySnapshot(profile.snapshot);
    setActiveProfileId(profileId);
    const displayName = profile.isDefault ? t(profile.name) : profile.name;
    toast({ title: t('profiles.activated', { name: displayName }) });
    close();
  }, [profiles, setActiveProfileId, close, t]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      setSearch('');
      // Small delay to ensure the dialog is rendered
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle navigation
  const handleNavigate = React.useCallback((path: string, recentInfo?: { title: string; icon: string }) => {
    close();
    if (recentInfo) {
      addRecent({ path, title: recentInfo.title, icon: recentInfo.icon });
    }
    if (location.pathname !== path) {
      navigate(path);
    }
  }, [close, navigate, location.pathname, addRecent]);

  // Handle theme toggle
  const handleToggleTheme = React.useCallback(() => {
    toggleTheme();
    const newMode = theme === 'dark' ? 'light' : 'dark';
    addRecent({ path: '__action:theme', title: newMode === 'dark' ? 'Dark mode' : 'Light mode', icon: 'sun', type: 'action' });
    close();
  }, [theme, toggleTheme, close, addRecent]);

  // Handle language change
  const handleLanguageChange = React.useCallback((lang: string) => {
    changeLanguage(lang);
    addRecent({ path: '__action:language', title: `Language: ${lang.toUpperCase()}`, icon: 'languages', type: 'action' });
    close();
  }, [changeLanguage, close, addRecent]);

  // Get module info from modules list
  const getModuleInfo = React.useCallback((path: string): AppModuleDTO | undefined => {
    return modules.find((m) => m.routePath === path || `/${m.routePath}` === path);
  }, [modules]);

  // Filter pinned modules with full info
  const pinnedWithInfo = React.useMemo(() => {
    return pinnedModules
      .map((path) => {
        const moduleInfo = getModuleInfo(path);
        const recentInfo = recentModules.find((r) => r.path === path);
        return moduleInfo || recentInfo ? { path, module: moduleInfo, recent: recentInfo } : null;
      })
      .filter(Boolean) as Array<{ path: string; module?: AppModuleDTO; recent?: typeof recentModules[0] }>;
  }, [pinnedModules, getModuleInfo, recentModules]);

  // Handle search result selection
  const handleResultSelect = React.useCallback((result: SearchResult) => {
    close();
    navigate(result.path);
  }, [close, navigate]);

  // Determine what sections to show based on mode
  const showCommands = parsed.mode === 'command' || parsed.mode === 'mixed';
  const showNavigation = parsed.mode === 'mixed'; // Pinned, Recent, Navigation, Modules — only in mixed mode
  const showEntities = parsed.mode === 'entity' || parsed.mode === 'tag' || parsed.mode === 'mixed';

  // Placeholder based on mode
  const placeholderText = React.useMemo(() => {
    if (search.startsWith('>')) return t('commandPalette.placeholders.commands');
    if (search.startsWith('@')) return t('commandPalette.placeholders.entities');
    if (search.startsWith('#')) return t('commandPalette.placeholders.tags');
    return t('commandPalette.placeholder');
  }, [search, t]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={close}
          />
          
          {/* Command Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-1/2 top-[12%] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 mx-4 sm:mx-0 sm:w-full max-h-[80vh] flex flex-col"
          >
            <Command
              className={cn(
                'rounded-xl border border-border/50',
                'bg-card/80 backdrop-blur-xl shadow-2xl',
                'overflow-hidden flex flex-col max-h-[80vh]'
              )}
              loop
              shouldFilter={parsed.mode === 'mixed' || parsed.mode === 'command'}
              filter={(value, _search) => {
                // Use the stripped query (without prefix) for filtering
                const q = parsed.query.toLowerCase();
                if (!q) return 1;
                if (value.toLowerCase().includes(q)) return 1;
                return 0;
              }}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 border-b border-border/50">
                {isSearching ? (
                  <Loader2 className="h-4 w-4 text-muted-foreground shrink-0 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <Command.Input
                  ref={inputRef}
                  value={search}
                  onValueChange={setSearch}
                  placeholder={placeholderText}
                  className={cn(
                    'flex-1 h-12 bg-transparent',
                    'text-sm placeholder:text-muted-foreground',
                    'outline-none border-none'
                  )}
                />
                {/* Mode indicator badge */}
                {parsed.mode !== 'mixed' && search.length > 0 && (
                  <span className={cn(
                    'px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0',
                    parsed.mode === 'command' && 'bg-violet-500/15 text-violet-400',
                    parsed.mode === 'entity' && 'bg-blue-500/15 text-blue-400',
                    parsed.mode === 'tag' && 'bg-amber-500/15 text-amber-400',
                  )}>
                    {parsed.mode === 'command' && t('commandPalette.modes.command')}
                    {parsed.mode === 'entity' && t('commandPalette.modes.entity')}
                    {parsed.mode === 'tag' && t('commandPalette.modes.tag')}
                  </span>
                )}
                <button
                  onClick={close}
                  className="p-1 rounded hover:bg-muted/50 transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Mode hints — shown when input is empty */}
              {!search && <ModeHints t={t} />}

              {/* Results */}
              <Command.List className="flex-1 overflow-y-auto p-2">
                {/* Empty state — géré manuellement pour éviter les faux positifs de cmdk */}
                {!isSearching && !hasEntityResults && showEntities && !showCommands && entityQuery.length >= 2 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {t('commandPalette.noResults')}
                  </div>
                )}
                {isSearching && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {t('commandPalette.searching')}
                  </div>
                )}
                {/* En mode commandes, laisser cmdk gérer le empty */}
                {showCommands && !showEntities && (
                  <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                    {t('commandPalette.noResults')}
                  </Command.Empty>
                )}

                {/* ── ENTITY RESULTS (from federated search) ── */}
                {showEntities && hasEntityResults && (
                  <>
                    {searchResults!.bacteria.length > 0 && (
                      <CommandGroup heading={resultTypeLabels.bacterium}>
                        {searchResults!.bacteria.map((r) => (
                          <SearchResultItem
                            key={`b-${r.id}`}
                            result={r}
                            onSelect={() => handleResultSelect(r)}
                          />
                        ))}
                      </CommandGroup>
                    )}

                    {searchResults!.fungi.length > 0 && (
                      <CommandGroup heading={resultTypeLabels.fungus}>
                        {searchResults!.fungi.map((r) => (
                          <SearchResultItem
                            key={`f-${r.id}`}
                            result={r}
                            onSelect={() => handleResultSelect(r)}
                          />
                        ))}
                      </CommandGroup>
                    )}

                    {searchResults!.contacts.length > 0 && (
                      <CommandGroup heading={resultTypeLabels.contact}>
                        {searchResults!.contacts.map((r) => (
                          <SearchResultItem
                            key={`c-${r.id}`}
                            result={r}
                            onSelect={() => handleResultSelect(r)}
                          />
                        ))}
                      </CommandGroup>
                    )}

                    {searchResults!.notes.length > 0 && (
                      <CommandGroup heading={resultTypeLabels.note}>
                        {searchResults!.notes.map((r) => (
                          <SearchResultItem
                            key={`n-${r.id}`}
                            result={r}
                            onSelect={() => handleResultSelect(r)}
                          />
                        ))}
                      </CommandGroup>
                    )}
                  </>
                )}

                {/* ── COMMANDS & NAVIGATION ── */}
                {showCommands && (
                  <>
                {/* Pinned Modules */}
                {showNavigation && pinnedWithInfo.length > 0 && (
                  <CommandGroup heading={t('commandPalette.pinned')}>
                    {pinnedWithInfo.map(({ path, module, recent }) => (
                      <CommandItem
                        key={path}
                        icon={<Pin className="h-4 w-4" />}
                        onSelect={() => handleNavigate(path)}
                        keywords={[
                          module?.title || recent?.title || '',
                          t('commandPalette.keywords.pinned'),
                        ]}
                      >
                        <span className="flex items-center gap-2">
                          {module?.icon && getIconComponent(module.icon)}
                          {module?.title || recent?.title || path}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Recent (navigation + actions) */}
                {showNavigation && recentModules.filter(r => r.type !== 'action').length > 0 && (
                  <CommandGroup heading={t('commandPalette.recent')}>
                    {recentModules.filter(r => r.type !== 'action').slice(0, 5).map((recent) => (
                      <CommandItem
                        key={recent.path}
                        icon={<Clock className="h-4 w-4" />}
                        onSelect={() => handleNavigate(recent.path)}
                        keywords={[recent.title, t('commandPalette.keywords.recent')]}
                      >
                        <span className="flex items-center gap-2">
                          {getIconComponent(recent.icon)}
                          {recent.title}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Recent actions — visible in mixed AND command mode */}
                {recentModules.filter(r => r.type === 'action').length > 0 && (
                  <CommandGroup heading={t('commandPalette.recentActions')}>
                    {recentModules.filter(r => r.type === 'action').slice(0, 5).map((recent) => (
                      <CommandItem
                        key={recent.path}
                        icon={<Clock className="h-4 w-4" />}
                        onSelect={() => {
                          if (recent.path === '__action:theme') { handleToggleTheme(); return; }
                          if (recent.path === '__action:language') { handleLanguageChange(language === 'fr' ? 'en' : 'fr'); return; }
                          if (recent.path === '__action:tabbar') { toggleTabBar(); close(); return; }
                          if (recent.path === '__action:sidebar') { toggleGlobalSidebar(); close(); return; }
                          if (recent.path === '__action:activitybar') { toggleActivityBar(); close(); return; }
                          if (recent.path === '__action:filters-panel') { toggleActivityPanel('tools'); close(); return; }
                          if (recent.path === '__action:notes-panel') { toggleActivityPanel('notes'); close(); return; }
                          if (recent.path === '__action:focusmode') { toggleFocusMode(); close(); return; }
                          close();
                        }}
                        keywords={[recent.title, t('commandPalette.keywords.recent')]}
                      >
                        <span className="flex items-center gap-2">
                          {getIconComponent(recent.icon)}
                          {recent.title}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Navigation */}
                {showNavigation && (
                <CommandGroup heading={t('commandPalette.navigation')}>
                  <CommandItem
                    icon={<Home className="h-4 w-4" />}
                    onSelect={() => handleNavigate('/')}
                    keywords={keywordHome}
                  >
                    {t('common.home')}
                  </CommandItem>
                  <CommandItem
                    icon={<BookOpen className="h-4 w-4" />}
                    onSelect={() => handleNavigate('/atlas')}
                    keywords={keywordAtlas}
                  >
                    {t('atlas.title')}
                  </CommandItem>
                  <CommandItem
                    icon={<FlaskConical className="h-4 w-4" />}
                    onSelect={() => handleNavigate('/lab')}
                    keywords={keywordLab}
                  >
                    {t('home.huginLab')}
                  </CommandItem>
                  <CommandItem
                    icon={<User className="h-4 w-4" />}
                    onSelect={() => handleNavigate('/profile', { title: t('profile.title'), icon: 'user' })}
                    keywords={keywordProfile}
                  >
                    {t('profile.title')}
                  </CommandItem>
                  <CommandItem
                    icon={<Settings className="h-4 w-4" />}
                    onSelect={() => handleNavigate('/settings', { title: t('settingsPage.title'), icon: 'settings' })}
                    keywords={keywordSettings}
                  >
                    {t('settingsPage.title')}
                  </CommandItem>
                </CommandGroup>
                )}

                {/* All Modules (excluding pinned & recent to avoid duplicates) */}
                {showNavigation && modules.length > 0 && (() => {
                  const pinnedPaths = new Set(pinnedModules);
                  const recentPaths = new Set(recentModules.slice(0, 5).map((r) => r.path));
                  const filtered = modules.filter((module) => {
                    const path = module.routePath.startsWith('/') ? module.routePath : `/${module.routePath}`;
                    return !pinnedPaths.has(path) && !recentPaths.has(path);
                  });
                  return filtered.length > 0 ? (
                    <CommandGroup heading={t('commandPalette.modules')}>
                      {filtered.map((module) => (
                        <CommandItem
                          key={module.moduleKey}
                          icon={getIconComponent(module.icon)}
                          onSelect={() => handleNavigate(module.routePath.startsWith('/') ? module.routePath : `/${module.routePath}`)}
                          keywords={[module.title, module.moduleKey, module.description || '']}
                        >
                          {module.title}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : null;
                })()}

                {/* Actions */}
                <CommandGroup heading={t('commandPalette.actions')}>
                  <CommandItem
                    icon={theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    onSelect={handleToggleTheme}
                    keywords={keywordTheme}
                  >
                    {theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}
                  </CommandItem>
                  <CommandItem
                    icon={<Languages className="h-4 w-4" />}
                    onSelect={() => handleLanguageChange(language === 'fr' ? 'en' : 'fr')}
                    keywords={keywordLanguage}
                  >
                    {t('settings.language')}: {getLanguageLabel(language === 'fr' ? 'en' : 'fr')}
                  </CommandItem>
                  <CommandItem
                    icon={<PanelTop className="h-4 w-4" />}
                    shortcut={formatKeyCombo(getEffectiveCombo('toggleTabBar'))}
                    onSelect={() => { toggleTabBar(); addRecent({ path: '__action:tabbar', title: tabBarVisible ? 'Hide Tabs' : 'Show Tabs', icon: 'panel-top', type: 'action' }); close(); }}
                    keywords={keywordTabs}
                  >
                    {tabBarVisible ? t('workspace.hideTabs') : t('workspace.showTabs')}
                  </CommandItem>
                  <CommandItem
                    icon={<PanelLeft className="h-4 w-4" />}
                    shortcut={formatKeyCombo(getEffectiveCombo('toggleSidebar'))}
                    onSelect={() => { toggleGlobalSidebar(); addRecent({ path: '__action:sidebar', title: globalSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar', icon: 'panel-left', type: 'action' }); close(); }}
                    keywords={keywordSidebar}
                  >
                    {globalSidebarOpen ? t('workspace.collapse') : t('workspace.expand')}
                  </CommandItem>
                  <CommandItem
                    icon={<LayoutGrid className="h-4 w-4" />}
                    shortcut={formatKeyCombo(getEffectiveCombo('toggleActivityBar'))}
                    onSelect={() => { toggleActivityBar(); addRecent({ path: '__action:activitybar', title: activityBarVisible ? 'Hide Activity Bar' : 'Show Activity Bar', icon: 'layout-grid', type: 'action' }); close(); }}
                    keywords={keywordActivityBar}
                  >
                    {activityBarVisible ? t('activityBar.hide') : t('activityBar.show')}
                  </CommandItem>
                  <CommandItem
                    icon={<PanelLeft className="h-4 w-4" />}
                    onSelect={() => { setActivityBarPosition('left'); addRecent({ path: '__action:activitybar-left', title: 'Move Activity Bar to Left', icon: 'panel-left', type: 'action' }); close(); }}
                    keywords={['activity', 'bar', 'move', 'left', 'position', 'gauche', 'déplacer']}
                  >
                    {t('activityBar.moveToLeft')}
                  </CommandItem>
                  <CommandItem
                    icon={<PanelTop className="h-4 w-4" />}
                    onSelect={() => { setActivityBarPosition('top'); addRecent({ path: '__action:activitybar-top', title: 'Move Activity Bar to Top', icon: 'panel-top', type: 'action' }); close(); }}
                    keywords={['activity', 'bar', 'move', 'top', 'position', 'haut', 'déplacer']}
                  >
                    {t('activityBar.moveToTop')}
                  </CommandItem>
                  <CommandItem
                    icon={<PanelRight className="h-4 w-4" />}
                    onSelect={() => { setActivityBarPosition('right'); addRecent({ path: '__action:activitybar-right', title: 'Move Activity Bar to Right', icon: 'panel-right', type: 'action' }); close(); }}
                    keywords={['activity', 'bar', 'move', 'right', 'position', 'droite', 'déplacer']}
                  >
                    {t('activityBar.moveToRight')}
                  </CommandItem>
                  <CommandItem
                    icon={<PanelBottom className="h-4 w-4" />}
                    onSelect={() => { setActivityBarPosition('bottom'); addRecent({ path: '__action:activitybar-bottom', title: 'Move Activity Bar to Bottom', icon: 'panel-bottom', type: 'action' }); close(); }}
                    keywords={['activity', 'bar', 'move', 'bottom', 'position', 'bas', 'déplacer']}
                  >
                    {t('activityBar.moveToBottom')}
                  </CommandItem>
                  <CommandItem
                    icon={<PanelBottom className="h-4 w-4" />}
                    onSelect={() => { toggleStatusBar(); addRecent({ path: '__action:statusbar', title: statusBarVisible ? 'Hide Status Bar' : 'Show Status Bar', icon: 'panel-bottom', type: 'action' }); close(); }}
                    keywords={keywordStatusBar}
                  >
                    {statusBarVisible ? t('statusBar.hide') : t('statusBar.show')}
                  </CommandItem>
                  <CommandItem
                    icon={<PanelTop className="h-4 w-4" />}
                    onSelect={() => { toggleMenuBar(); addRecent({ path: '__action:menubar', title: menuBarVisible ? 'Hide Menu Bar' : 'Show Menu Bar', icon: 'panel-top', type: 'action' }); close(); }}
                    keywords={keywordMenuBar}
                  >
                    {menuBarVisible ? t('menuBar.hide') : t('menuBar.show')}
                  </CommandItem>
                  <CommandItem
                    icon={<SlidersHorizontal className="h-4 w-4" />}
                    onSelect={() => { toggleActivityPanel('tools'); addRecent({ path: '__action:filters-panel', title: activeActivityPanel === 'tools' ? 'Hide Tools' : 'Show Tools', icon: 'sliders-horizontal', type: 'action' }); close(); }}
                    keywords={keywordFiltersPanel}
                  >
                    {activeActivityPanel === 'tools' ? t('commandPalette.hideFilters') : t('commandPalette.showFilters')}
                  </CommandItem>
                  <CommandItem
                    icon={<NotebookPen className="h-4 w-4" />}
                    onSelect={() => { toggleActivityPanel('notes'); addRecent({ path: '__action:notes-panel', title: activeActivityPanel === 'notes' ? 'Hide Notes' : 'Show Notes', icon: 'notebook-pen', type: 'action' }); close(); }}
                    keywords={keywordNotesPanel}
                  >
                    {activeActivityPanel === 'notes' ? t('commandPalette.hideNotes') : t('commandPalette.showNotes')}
                  </CommandItem>
                  <CommandItem
                    icon={focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    shortcut={formatKeyCombo(getEffectiveCombo('toggleFocusMode'))}
                    onSelect={() => { toggleFocusMode(); addRecent({ path: '__action:focusmode', title: focusMode ? 'Exit Focus' : 'Focus Mode', icon: 'maximize', type: 'action' }); close(); }}
                    keywords={keywordFocus}
                  >
                    {focusMode ? t('focusMode.exit') : t('focusMode.enter')}
                  </CommandItem>
                  <CommandItem
                    icon={<Activity className="h-4 w-4" />}
                    onSelect={() => {
                      useBottomPanelStore.getState().toggleVisible();
                      const nowVisible = useBottomPanelStore.getState().visible;
                      addRecent({ path: '__action:bottompanel', title: nowVisible ? 'Show Panel' : 'Hide Panel', icon: 'activity', type: 'action' });
                      close();
                    }}
                    keywords={['panel', 'bottom', 'activity', 'log', 'output', 'terminal', 'panneau', 'activité']}
                  >
                    {useBottomPanelStore.getState().visible ? t('bottomPanel.hide') : t('bottomPanel.show')}
                  </CommandItem>
                  <CommandItem
                    icon={<Activity className="h-4 w-4" />}
                    onSelect={() => {
                      useBottomPanelStore.getState().setAlignment('center');
                      addRecent({ path: '__action:panelalign-center', title: 'Panel: Center', icon: 'activity', type: 'action' });
                      close();
                    }}
                    keywords={['panel', 'alignment', 'center', 'centre', 'alignement', 'panneau']}
                  >
                    {t('bottomPanel.alignment')}: {t('bottomPanel.alignCenter')}
                  </CommandItem>
                  <CommandItem
                    icon={<Activity className="h-4 w-4" />}
                    onSelect={() => {
                      useBottomPanelStore.getState().setAlignment('left');
                      addRecent({ path: '__action:panelalign-left', title: 'Panel: Left', icon: 'activity', type: 'action' });
                      close();
                    }}
                    keywords={['panel', 'alignment', 'left', 'gauche', 'alignement', 'panneau']}
                  >
                    {t('bottomPanel.alignment')}: {t('bottomPanel.alignLeft')}
                  </CommandItem>
                  <CommandItem
                    icon={<Activity className="h-4 w-4" />}
                    onSelect={() => {
                      useBottomPanelStore.getState().setAlignment('right');
                      addRecent({ path: '__action:panelalign-right', title: 'Panel: Right', icon: 'activity', type: 'action' });
                      close();
                    }}
                    keywords={['panel', 'alignment', 'right', 'droite', 'alignement', 'panneau']}
                  >
                    {t('bottomPanel.alignment')}: {t('bottomPanel.alignRight')}
                  </CommandItem>
                  <CommandItem
                    icon={<Activity className="h-4 w-4" />}
                    onSelect={() => {
                      useBottomPanelStore.getState().setAlignment('justify');
                      addRecent({ path: '__action:panelalign-justify', title: 'Panel: Justify', icon: 'activity', type: 'action' });
                      close();
                    }}
                    keywords={['panel', 'alignment', 'justify', 'justifier', 'alignement', 'panneau', 'both', 'sidebar']}
                  >
                    {t('bottomPanel.alignment')}: {t('bottomPanel.alignJustify')}
                  </CommandItem>
                  <CommandItem
                    icon={<Layers className="h-4 w-4" />}
                    onSelect={() => {
                      useSidebarModeStore.getState().togglePrimaryMode();
                      const mode = useSidebarModeStore.getState().primaryMode;
                      addRecent({ path: '__action:sidebar-mode-primary', title: `Primary Sidebar: ${mode}`, icon: 'layers', type: 'action' });
                      close();
                    }}
                    keywords={['sidebar', 'primary', 'mode', 'dock', 'overlay', 'float', 'barre', 'latérale', 'superposer', 'ancrer', 'principale']}
                  >
                    {t('settingsPage.primarySidebarMode')}: {useSidebarModeStore.getState().primaryMode === 'dock' ? t('settingsPage.sidebarModeDock') : t('settingsPage.sidebarModeOverlay')}
                  </CommandItem>
                  <CommandItem
                    icon={<Layers className="h-4 w-4" />}
                    onSelect={() => {
                      useSidebarModeStore.getState().toggleSecondaryMode();
                      const mode = useSidebarModeStore.getState().secondaryMode;
                      addRecent({ path: '__action:sidebar-mode-secondary', title: `Secondary Sidebar: ${mode}`, icon: 'layers', type: 'action' });
                      close();
                    }}
                    keywords={['sidebar', 'secondary', 'mode', 'dock', 'overlay', 'float', 'barre', 'latérale', 'superposer', 'ancrer', 'secondaire', 'detail', 'détail']}
                  >
                    {t('settingsPage.secondarySidebarMode')}: {useSidebarModeStore.getState().secondaryMode === 'dock' ? t('settingsPage.sidebarModeDock') : t('settingsPage.sidebarModeOverlay')}
                  </CommandItem>
                  <CommandItem
                    icon={<Columns2 className="h-4 w-4" />}
                    onSelect={() => {
                      useEditorGroupsStore.getState().toggleSplit();
                      const nowSplit = useEditorGroupsStore.getState().splitActive;
                      addRecent({ path: '__action:split', title: nowSplit ? 'Split Editor' : 'Close Split', icon: 'columns-2', type: 'action' });
                      close();
                    }}
                    keywords={['split', 'diviser', 'editor', 'group', 'side by side', 'côte à côte', 'multi']}
                  >
                    {useEditorGroupsStore.getState().splitActive ? t('editorGroups.closeSplit') : t('editorGroups.splitHorizontal')}
                  </CommandItem>
                  <CommandItem
                    icon={<Keyboard className="h-4 w-4" />}
                    onSelect={() => handleNavigate('/settings', { title: t('settingsPage.keybindings'), icon: 'keyboard' })}
                    keywords={keywordKeybindings}
                  >
                    {t('settingsPage.keybindings')}
                  </CommandItem>
                  <CommandItem
                    icon={<LayoutDashboard className="h-4 w-4" />}
                    onSelect={() => handleNavigate('/', { title: t('common.home'), icon: 'layout-dashboard' })}
                    keywords={['dashboard', 'customize', 'widget', 'tableau de bord', 'personnaliser', 'accueil']}
                  >
                    {t('common.home')}
                  </CommandItem>
                </CommandGroup>

                {/* Profiles — only in command mode with > prefix or mixed */}
                {profiles.length > 1 && (
                  <CommandGroup heading={t('profiles.switchProfile')}>
                    {profiles.map((profile) => {
                      const displayName = profile.isDefault ? t(profile.name) : profile.name;
                      const isActive = activeProfileId === profile.id;
                      return (
                        <CommandItem
                          key={profile.id}
                          icon={<UserCircle className="h-4 w-4" />}
                          onSelect={() => handleSwitchProfile(profile.id)}
                          keywords={['profile', 'profil', 'switch', 'changer', displayName]}
                        >
                          <span className="flex items-center gap-2">
                            {getIconComponent(profile.icon)}
                            {displayName}
                            {isActive && (
                              <span className="text-[10px] text-muted-foreground ml-1">
                                ({t('profiles.active')})
                              </span>
                            )}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}

                  </>
                )}

              </Command.List>

              {/* Footer with keyboard hints */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border/30 text-[10px] text-muted-foreground/50">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-muted/30 rounded text-[9px]">↑↓</kbd>
                    {t('commandPalette.navigate')}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-muted/30 rounded text-[9px]">↵</kbd>
                    {t('commandPalette.select')}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-muted/30 rounded text-[9px]">Esc</kbd>
                    {t('commandPalette.close')}
                  </span>
                </div>
                {searchResults && (parsed.mode === 'entity' || parsed.mode === 'tag') && entityQuery.length >= 2 && (
                  <span>
                    {t('commandPalette.resultCount', { count: searchResults.total })}
                  </span>
                )}
              </div>

            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
