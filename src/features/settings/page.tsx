'use client';

import { useTranslation } from 'react-i18next';
import {
  Settings,
  Globe,
  Bell,
  Palette,
  Info,
  Maximize,
  Navigation,
  LayoutGrid,
  Rows3,
  Keyboard,
  UserCircle,
  PanelBottom,
  PanelTop,
  Layers,
  Activity,
  Columns2,
  Route,
} from 'lucide-react';
import { SettingsLayout, type SettingsSection } from '@/components/modules/layout';
import { AppearanceSection } from './components/appearance-section';
import { LanguageSection } from './components/language-section';
import { DensitySection } from './components/density-section';
import { NotificationsSection } from './components/notifications-section';
import { FocusSection } from './components/focus-section';
import { NavigationSection } from './components/navigation-section';
import { StatusBarSection } from './components/status-bar-section';
import { MenuBarSection } from './components/menu-bar-section';
import { SidebarModeSection } from './components/sidebar-mode-section';
import { BottomPanelSection } from './components/bottom-panel-section';
import { SplitViewSection } from './components/split-view-section';
import { ActivityBarSection } from './components/activity-bar-section';
import { KeybindingsSection } from './components/keybindings-section';
import { ProfilesSection } from './components/profiles-section';
import { ToursSection } from './components/tours-section';
import { AboutSection } from './components/about-section';

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE - Application settings
// VS Code-inspired layout: sidebar TOC + search + scrollable content
// ═══════════════════════════════════════════════════════════════════════════

// System pages use the theme's native --color-primary (no custom accent)

export function SettingsPage() {
  const { t } = useTranslation();

  // ─── Settings sections for TOC navigation ───
  const sections: SettingsSection[] = [
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
    { id: 'tours', icon: Route, labelKey: 'settingsPage.tours', keywords: ['tour', 'visite', 'guide', 'tutoriel', 'tutorial', 'onboarding', 'replay', 'rejouer'] },
    { id: 'about', icon: Info, labelKey: 'settingsPage.about', keywords: ['about', 'version', 'info', 'à propos'] },
  ];

  return (
    <SettingsLayout
      title={t('settingsPage.title')}
      icon={Settings}
      sections={sections}
    >
      {(filteredSectionIds) => (<>
              {filteredSectionIds.includes('appearance') && <AppearanceSection />}
              {filteredSectionIds.includes('language') && <LanguageSection />}
              {filteredSectionIds.includes('density') && <DensitySection />}
              {filteredSectionIds.includes('notifications') && <NotificationsSection />}
              {filteredSectionIds.includes('focus') && <FocusSection />}
              {filteredSectionIds.includes('navigation') && <NavigationSection />}
              {filteredSectionIds.includes('status-bar') && <StatusBarSection />}
              {filteredSectionIds.includes('menu-bar') && <MenuBarSection />}
              {filteredSectionIds.includes('sidebar-mode') && <SidebarModeSection />}
              {filteredSectionIds.includes('bottom-panel') && <BottomPanelSection />}
              {filteredSectionIds.includes('split-view') && <SplitViewSection />}
              {filteredSectionIds.includes('activity-bar') && <ActivityBarSection />}
              {filteredSectionIds.includes('keybindings') && <KeybindingsSection />}
              {filteredSectionIds.includes('profiles') && <ProfilesSection />}
              {filteredSectionIds.includes('tours') && <ToursSection />}
              {filteredSectionIds.includes('about') && <AboutSection />}
      </>)}
    </SettingsLayout>
  );
}
