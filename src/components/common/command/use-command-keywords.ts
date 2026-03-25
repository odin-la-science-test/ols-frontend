import { useTranslation } from 'react-i18next';

// ═══════════════════════════════════════════════════════════════════════════
// Keyword arrays pour le filtrage cmdk de la command palette
// ═══════════════════════════════════════════════════════════════════════════

export function useCommandKeywords() {
  const { t } = useTranslation();

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

  return {
    keywordHome,
    keywordAtlas,
    keywordLab,
    keywordTheme,
    keywordLanguage,
    keywordTabs,
    keywordSidebar,
    keywordActivityBar,
    keywordStatusBar,
    keywordMenuBar,
    keywordFiltersPanel,
    keywordNotesPanel,
    keywordFocus,
    keywordKeybindings,
    keywordProfile,
    keywordSettings,
  };
}
