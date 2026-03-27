import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { driver } from 'driver.js';
import { registry } from '@/lib/module-registry';
import { useTourStore } from '@/stores/tour-store';
import { isTourActive } from '@/lib/tour/tour-driver';
import { logger } from '@/lib/logger';

// ═══════════════════════════════════════════════════════════════════════════
// USE SMART TIPS — Auto-triggers contextual tips on navigation
//
// Evaluates tips from the module registry after each route change,
// once the module page has rendered (DOM elements available).
// Shows at most one tip per session.
// ═══════════════════════════════════════════════════════════════════════════

const SESSION_KEY = 'ols-smart-tips-shown';

export function useSmartTips(): void {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { isTipDismissed, dismissTip } = useTourStore();
  const shownThisSession = useRef(!!sessionStorage.getItem(SESSION_KEY));

  useEffect(() => {
    if (shownThisSession.current) return;

    // Wait for module page to render (DOM elements need to exist)
    const timer = setTimeout(() => {
      if (shownThisSession.current) return;

      // Only show tips from the module matching the current route
      const currentModule = registry.getByRoute(pathname);
      if (!currentModule?.tips) return;

      const candidates = currentModule.tips
        .filter((tip) => !isTipDismissed(tip.id));

      for (const tip of candidates) {
        if (tip.condition && !tip.condition()) continue;
        if (isTourActive()) break;

        const el = document.querySelector(tip.element);
        if (!el) continue;

        logger.debug(`[smart-tips] Showing tip: ${tip.id}`);
        shownThisSession.current = true;
        sessionStorage.setItem(SESSION_KEY, '1');

        const d = driver({
          steps: [{ element: tip.element, popover: { description: t(tip.descriptionKey), side: tip.side ?? 'bottom', popoverClass: 'ols-tour-popover' } }],
          showButtons: ['close'],
          showProgress: false,
          allowClose: true,
          overlayColor: 'transparent',
          stagePadding: 4,
          stageRadius: 6,
          onDestroyed: () => dismissTip(tip.id),
        });
        d.drive();
        break;
      }
    }, 800); // Delay to let module page mount and render

    return () => clearTimeout(timer);
  }, [pathname, t, isTipDismissed, dismissTip]);
}
