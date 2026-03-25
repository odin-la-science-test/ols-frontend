import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { FormSection } from '@/components/modules/shared';
import { BetaBadge } from '@/components/common';
import { APP_VERSION, IS_BETA } from '@/lib/app-version';

// ─── About Section ───

export function AboutSection() {
  const { t } = useTranslation();

  return (
    <FormSection
      id="about"
      title={t('settingsPage.about')}
      icon={Info}
      delay={8}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('settingsPage.version')}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-foreground">{APP_VERSION}</span>
            <BetaBadge />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('settingsPage.platform')}</span>
          <span className="text-xs text-foreground">{t('common.appName')}</span>
        </div>
        {IS_BETA && (
          <a
            href="/beta-conditions"
            className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
          >
            {t('beta.conditionsLink')}
          </a>
        )}
      </div>
    </FormSection>
  );
}
