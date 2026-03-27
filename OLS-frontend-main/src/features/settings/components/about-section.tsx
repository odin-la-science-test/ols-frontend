import { useTranslation } from 'react-i18next';
import { Info, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui';
import { FormSection } from '@/components/modules/shared';
import { BetaBadge } from '@/components/common';
import { APP_VERSION, IS_BETA } from '@/lib/app-version';
import { useWhatsNewStore } from '@/stores/whats-new-store';

// ─── About Section ───

export function AboutSection() {
  const { t } = useTranslation();
  const openWhatsNew = useWhatsNewStore((s) => s.open);

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
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('settingsPage.whatsNew')}</span>
          <Button variant="ghost" size="sm" onClick={openWhatsNew} className="gap-1.5 h-7 text-xs">
            <Newspaper className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t('whatsNew.viewAgain')}
          </Button>
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
