import { useTranslation } from 'react-i18next';
import { Route } from 'lucide-react';
import { FormSection } from '@/components/modules/shared';
import { useTourStore } from '@/stores/tour-store';
import { preferencesApi } from '@/api';
import { collectPreferences } from '@/lib/preferences-sync';
import { useAuthStore } from '@/stores/auth-store';
import { logger } from '@/lib/logger';

const log = logger.tagged('tours-section');

// ─── Tours Section ───

export function ToursSection() {
  const { t } = useTranslation();
  const { completedTours, resetAll } = useTourStore();
  const { isAuthenticated, isGuest } = useAuthStore();

  const handleReset = async () => {
    resetAll();

    // Push the reset to the server so it persists across devices
    if (isAuthenticated && !isGuest()) {
      try {
        const prefs = collectPreferences();
        await preferencesApi.update({
          preferencesJson: JSON.stringify(prefs),
          lastModified: new Date().toISOString(),
          version: 1,
        });
        log.info('Tours reset synced to server');
      } catch (err) {
        log.error('Failed to sync tour reset to server', err);
      }
    }
  };

  return (
    <FormSection
      id="tours"
      title={t('settingsPage.tours')}
      description={t('settingsPage.toursDesc')}
      icon={Route}
      delay={8}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm text-muted-foreground">
              {t('settingsPage.toursCompleted', { count: completedTours.length })}
            </p>
          </div>
          <button
            onClick={handleReset}
            disabled={completedTours.length === 0}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-muted/50 hover:bg-muted text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            {t('settingsPage.toursReset')}
          </button>
        </div>
      </div>
    </FormSection>
  );
}
