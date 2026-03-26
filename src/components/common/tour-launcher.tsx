'use client';

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTourStore } from '@/stores/tour-store';
import { useTour } from '@/hooks/use-tour';
import { registry } from '@/lib/module-registry';
import { globalTour } from '@/lib/tour/global-tour';
import { homeTour } from '@/lib/tour/home-tour';
import { atlasTour, labTour } from '@/lib/tour/hub-tour';
import { workspaceTour } from '@/lib/tour/workspace-tour';
import { profileTour } from '@/lib/tour/profile-tour';
import { settingsTour } from '@/lib/tour/settings-tour';
import { useAuthStore } from '@/stores/auth-store';

// ═══════════════════════════════════════════════════════════════════════════
// TOUR LAUNCHER — Centralized tour trigger logic
//
// Mounted in AppShell. Handles:
// - Home tour on first visit to dashboard (/)
// - Atlas/Lab hub tours on first visit to hubs
// - Global shell tour on first visit to any module (where chrome is visible)
// - Module tours on first navigation to a module
// - System page tours (profile, settings, workspace)
// - Manual replay via activeTourId
// ═══════════════════════════════════════════════════════════════════════════

const HOME_TOUR_DELAY = 1500;
const PAGE_TOUR_DELAY = 800;

/** All static tour definitions mapped by id */
const STATIC_TOURS: Record<string, typeof globalTour> = {
  'global-shell': globalTour,
  'home': homeTour,
  'hub-atlas': atlasTour,
  'hub-lab': labTour,
  'workspace': workspaceTour,
  'system-profile': profileTour,
  'system-settings': settingsTour,
};

export function TourLauncher() {
  const location = useLocation();
  const { isTourCompleted, activeTourId, setActiveTour } = useTourStore();
  const { runTour, triggerModuleTourIfNew } = useTour();
  const { isAuthenticated, isGuest } = useAuthStore();
  const hasTriggeredGlobalShell = useRef(false);

  // ─── Reset refs when tours are cleared (e.g. "replay all" in settings) ───
  const completedTours = useTourStore((s) => s.completedTours);
  useEffect(() => {
    if (completedTours.length === 0) {
      hasTriggeredGlobalShell.current = false;
    }
  }, [completedTours]);

  // ─── Home tour: first visit to dashboard ───
  useEffect(() => {
    if (!isAuthenticated || isGuest()) return;
    if (location.pathname !== '/') return;
    if (isTourCompleted('home')) return;

    const timer = setTimeout(() => runTour(homeTour), HOME_TOUR_DELAY);
    return () => clearTimeout(timer);
  }, [location.pathname, isAuthenticated, isGuest, isTourCompleted, runTour]);

  // ─── Hub tours: first visit to Atlas/Lab ───
  useEffect(() => {
    if (!isAuthenticated || isGuest()) return;

    if (location.pathname === '/atlas' && !isTourCompleted('hub-atlas')) {
      const timer = setTimeout(() => runTour(atlasTour), PAGE_TOUR_DELAY);
      return () => clearTimeout(timer);
    }
    if (location.pathname === '/lab' && !isTourCompleted('hub-lab')) {
      const timer = setTimeout(() => runTour(labTour), PAGE_TOUR_DELAY);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isAuthenticated, isGuest, isTourCompleted, runTour]);

  // ─── Global shell tour + module tours: first visit to a module page ───
  useEffect(() => {
    if (!isAuthenticated || isGuest()) return;

    // System page tours
    if (location.pathname === '/profile' && !isTourCompleted('system-profile')) {
      const timer = setTimeout(() => runTour(profileTour), PAGE_TOUR_DELAY);
      return () => clearTimeout(timer);
    }
    if (location.pathname === '/settings' && !isTourCompleted('system-settings')) {
      const timer = setTimeout(() => runTour(settingsTour), PAGE_TOUR_DELAY);
      return () => clearTimeout(timer);
    }
    if (location.pathname === '/workspace' && !isTourCompleted('workspace')) {
      const timer = setTimeout(() => runTour(workspaceTour), PAGE_TOUR_DELAY);
      return () => clearTimeout(timer);
    }

    // Module pages — global shell tour takes priority on first module visit
    const mod = registry.getByRoute(location.pathname);
    if (!mod) return;

    if (!hasTriggeredGlobalShell.current && !isTourCompleted('global-shell')) {
      hasTriggeredGlobalShell.current = true;
      const timer = setTimeout(() => runTour(globalTour), PAGE_TOUR_DELAY);
      return () => clearTimeout(timer);
    }

    // Module-specific tour
    if (mod.tour && mod.tour.length > 0) {
      const timer = setTimeout(() => triggerModuleTourIfNew(mod.id), PAGE_TOUR_DELAY);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isAuthenticated, isGuest, isTourCompleted, runTour, triggerModuleTourIfNew]);

  // ─── Manual replay via activeTourId ───
  useEffect(() => {
    if (!activeTourId) return;

    const staticTour = STATIC_TOURS[activeTourId];
    if (staticTour) {
      runTour(staticTour);
    } else {
      // Module tour
      const moduleId = activeTourId.replace(/^tour-/, '');
      const mod = registry.getById(moduleId);
      if (mod?.tour && mod.tour.length > 0) {
        runTour({ id: activeTourId, nameKey: mod.translationKey, steps: mod.tour });
      }
    }

    setActiveTour(null);
  }, [activeTourId, runTour, setActiveTour]);

  return null;
}
