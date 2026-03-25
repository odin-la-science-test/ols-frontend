'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
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
import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useGlobalSearch, parseSearchInput, type SearchResult } from '@/hooks';
import { registry } from '@/lib/module-registry';
import { toast } from '@/hooks';

import { CommandGroup } from './command-item';
import { SearchResultItem } from './search-result-item';
import { ModeHints } from './mode-hints';
import { CommandNavigation } from './command-navigation';
import { CommandActions } from './command-actions';
import { CommandLayoutActions } from './command-layout-actions';

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND PALETTE - Ctrl+K pour recherche rapide + recherche fédérée
// Desktop only - Inspiré de VS Code, Linear, Notion
// Prefixes: > commands, @ entities, # tags
// ═══════════════════════════════════════════════════════════════════════════

export function CommandPalette() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { isOpen, close } = useCommandPaletteStore();
  const { recentModules, pinnedModules, addRecent, tabBarVisible, toggleTabBar, focusMode, toggleFocusMode, statusBarVisible, toggleStatusBar, menuBarVisible, toggleMenuBar } = useWorkspaceStore();
  const { activityBarVisible, toggleActivityBar, togglePanel: toggleActivityPanel, setPosition: setActivityBarPosition } = useActivityBarStore();
  const activityPanelZone = usePanelRegistryStore((s) => s.zones['activity-panel'] ?? { stack: [], activeTab: null, viewMode: 'tabs' as const, isOpen: false });
  const toggleZone = usePanelRegistryStore((s) => s.toggleZone);
  const activityPanelOpen = activityPanelZone.isOpen && activityPanelZone.stack.length > 0;
  const activeActivityPanel = activityPanelZone.isOpen ? activityPanelZone.activeTab : null;
  const { theme, toggleTheme } = useThemeStore();
  const { language, changeLanguage } = useLanguageStore();
  const { profiles, activeProfileId, setActiveProfileId } = useProfilesStore();

  const modules = useMemo(() => registry.getAll().map((m) => ({
    moduleKey: m.moduleKey,
    title: t(m.translationKey),
    icon: m.icon,
    description: m.descriptionKey ? t(m.descriptionKey) : '',
    routePath: `/${m.route.path}`,
  })), [t]);

  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  // Parse search input for prefix modes
  const parsed = useMemo(() => parseSearchInput(search), [search]);

  // Federated search — only fires in 'entity', 'tag', or 'mixed' mode with enough characters
  const entityQuery = (parsed.mode === 'entity' || parsed.mode === 'tag' || parsed.mode === 'mixed') ? parsed.query : '';
  const searchMode = (parsed.mode === 'entity' || parsed.mode === 'tag') ? parsed.mode : 'entity';
  const { data: searchResults, isFetching: isSearching } = useGlobalSearch(entityQuery, searchMode);

  // Does the search have any entity results?
  const hasEntityResults = (searchResults?.total ?? 0) > 0;

  const getLanguageLabel = useCallback(
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

  // Handle profile switch
  const handleSwitchProfile = useCallback((profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;
    applySnapshot(profile.snapshot);
    setActiveProfileId(profileId);
    const displayName = profile.isDefault ? t(profile.name) : profile.name;
    toast({ title: t('profiles.activated', { name: displayName }) });
    close();
  }, [profiles, setActiveProfileId, close, t]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      // Small delay to ensure the dialog is rendered
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle navigation
  const handleNavigate = useCallback((path: string, recentInfo?: { title: string; icon: string }) => {
    close();
    if (recentInfo) {
      addRecent({ path, title: recentInfo.title, icon: recentInfo.icon });
    }
    if (location.pathname !== path) {
      navigate(path);
    }
  }, [close, navigate, location.pathname, addRecent]);

  // Handle theme toggle
  const handleToggleTheme = useCallback(() => {
    toggleTheme();
    const newMode = theme === 'dark' ? 'light' : 'dark';
    addRecent({ path: '__action:theme', title: newMode === 'dark' ? 'Dark mode' : 'Light mode', icon: 'sun', type: 'action' });
    close();
  }, [theme, toggleTheme, close, addRecent]);

  // Handle language change
  const handleLanguageChange = useCallback((lang: string) => {
    changeLanguage(lang);
    addRecent({ path: '__action:language', title: `Language: ${lang.toUpperCase()}`, icon: 'languages', type: 'action' });
    close();
  }, [changeLanguage, close, addRecent]);

  // Get module info from modules list
  const getModuleInfo = useCallback((path: string) => {
    return modules.find((m) => m.routePath === path || `/${m.routePath}` === path);
  }, [modules]);

  // Filter pinned modules with full info
  const pinnedWithInfo = useMemo(() => {
    return pinnedModules
      .map((path) => {
        const moduleInfo = getModuleInfo(path);
        const recentInfo = recentModules.find((r) => r.path === path);
        return moduleInfo || recentInfo ? { path, module: moduleInfo, recent: recentInfo } : null;
      })
      .filter(Boolean) as Array<{ path: string; module?: ReturnType<typeof getModuleInfo>; recent?: typeof recentModules[0] }>;
  }, [pinnedModules, getModuleInfo, recentModules]);

  // Handle search result selection
  const handleResultSelect = useCallback((result: SearchResult) => {
    close();
    navigate(result.path);
  }, [close, navigate]);

  // Determine what sections to show based on mode
  const showCommands = parsed.mode === 'command' || parsed.mode === 'mixed';
  const showNavigation = parsed.mode === 'mixed'; // Pinned, Recent, Navigation, Modules — only in mixed mode
  const showEntities = parsed.mode === 'entity' || parsed.mode === 'tag' || parsed.mode === 'mixed';

  // Placeholder based on mode
  const placeholderText = useMemo(() => {
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
            className="fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--color-background)_80%,transparent)] backdrop-blur-sm"
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
                'rounded-xl border border-[color-mix(in_srgb,var(--color-border)_50%,transparent)]',
                'bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)] backdrop-blur-xl shadow-2xl',
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
              <div className="flex items-center gap-3 px-4 border-b border-[color-mix(in_srgb,var(--color-border)_50%,transparent)]">
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
                  className="p-1 rounded hover:bg-[color-mix(in_srgb,var(--color-muted)_50%,transparent)] transition-colors"
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
                {showEntities && hasEntityResults && searchResults!.groups.map((group) => (
                  <CommandGroup key={group.moduleId} heading={t(group.typeLabel)}>
                    {group.results.map((r) => (
                      <SearchResultItem
                        key={`${group.moduleId}-${r.id}`}
                        result={r}
                        onSelect={() => handleResultSelect(r)}
                      />
                    ))}
                  </CommandGroup>
                ))}

                {/* ── COMMANDS & NAVIGATION ── */}
                {showCommands && (
                  <>
                    <CommandNavigation
                      showNavigation={showNavigation}
                      pinnedWithInfo={pinnedWithInfo}
                      recentModules={recentModules}
                      modules={modules}
                      pinnedModules={pinnedModules}
                      language={language}
                      handleNavigate={handleNavigate}
                      handleToggleTheme={handleToggleTheme}
                      handleLanguageChange={handleLanguageChange}
                      toggleTabBar={toggleTabBar}
                      toggleZone={toggleZone}
                      toggleActivityBar={toggleActivityBar}
                      toggleActivityPanel={toggleActivityPanel}
                      toggleFocusMode={toggleFocusMode}
                      close={close}
                    />

                    <CommandActions
                      theme={theme}
                      language={language}
                      tabBarVisible={tabBarVisible}
                      statusBarVisible={statusBarVisible}
                      menuBarVisible={menuBarVisible}
                      activityBarVisible={activityBarVisible}
                      activityPanelOpen={activityPanelOpen}
                      activeActivityPanel={activeActivityPanel}
                      focusMode={focusMode}
                      handleToggleTheme={handleToggleTheme}
                      handleLanguageChange={handleLanguageChange}
                      getLanguageLabel={getLanguageLabel}
                      toggleTabBar={toggleTabBar}
                      toggleZone={toggleZone}
                      toggleActivityBar={toggleActivityBar}
                      setActivityBarPosition={setActivityBarPosition}
                      toggleStatusBar={toggleStatusBar}
                      toggleMenuBar={toggleMenuBar}
                      toggleActivityPanel={toggleActivityPanel}
                      toggleFocusMode={toggleFocusMode}
                      addRecent={addRecent}
                      close={close}
                    />

                    <CommandLayoutActions
                      profiles={profiles}
                      activeProfileId={activeProfileId}
                      handleNavigate={handleNavigate}
                      handleSwitchProfile={handleSwitchProfile}
                      addRecent={addRecent}
                      close={close}
                    />
                  </>
                )}

              </Command.List>

              {/* Footer with keyboard hints */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-[color-mix(in_srgb,var(--color-border)_30%,transparent)] text-[10px] text-muted-foreground/50">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)] rounded text-[9px]">↑↓</kbd>
                    {t('commandPalette.navigate')}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)] rounded text-[9px]">↵</kbd>
                    {t('commandPalette.select')}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)] rounded text-[9px]">Esc</kbd>
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
