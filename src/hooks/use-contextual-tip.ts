import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { driver, type Driver } from 'driver.js';
import { useTourStore } from '@/stores/tour-store';
import type { ContextualTip } from '@/lib/tour/types';
import { isTourActive } from '@/lib/tour/tour-driver';

// ═══════════════════════════════════════════════════════════════════════════
// USE CONTEXTUAL TIP — Lightweight single-step hint using driver.js
//
// Shows a dismissible highlight on first encounter. Reuses the same
// driver.js theming as the full guided tours.
// ═══════════════════════════════════════════════════════════════════════════

const TIP_DELAY_MS = 1000;

export function useContextualTip(tip: ContextualTip) {
  const { t } = useTranslation();
  const { isTipDismissed, dismissTip } = useTourStore();
  const driverRef = useRef<Driver | null>(null);

  useEffect(() => {
    if (isTipDismissed(tip.id)) return;
    if (isTourActive()) return;
    if (tip.condition && !tip.condition()) return;

    const timer = setTimeout(() => {
      const el = document.querySelector(tip.element);
      if (!el) return;

      const d = driver({
        steps: [
          {
            element: tip.element,
            popover: {
              description: t(tip.descriptionKey),
              side: tip.side ?? 'bottom',
              popoverClass: 'ols-tour-popover',
            },
          },
        ],
        showButtons: ['close'],
        showProgress: false,
        allowClose: true,
        overlayColor: 'transparent',
        stagePadding: 4,
        stageRadius: 6,
        onDestroyed: () => {
          dismissTip(tip.id);
          driverRef.current = null;
        },
      });

      driverRef.current = d;
      d.drive();
    }, TIP_DELAY_MS);

    return () => {
      clearTimeout(timer);
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
    };
  }, [tip.id, tip.element, tip.descriptionKey, tip.side, tip.condition, t, isTipDismissed, dismissTip]);
}
