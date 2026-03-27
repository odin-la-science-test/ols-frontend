import { BookOpen } from 'lucide-react';
import { DotsBackground } from '@/components/common';
import { DashboardPageTemplate } from '@/components/modules/layout/dashboard-page-template';
import { useTranslation } from 'react-i18next';

// Couleur accent Munin Atlas (violet)
import { MUNIN_PRIMARY } from '@/lib/accent-colors';
const ACCENT_COLOR = MUNIN_PRIMARY;

export function MuninAtlasPage() {
  const { t } = useTranslation();

  return (
    <DashboardPageTemplate
      category="MUNIN_ATLAS"
      translations={{
        titleText: t('atlas.title'),
        subtitleText: t('atlas.subtitle'),
        loadingText: t('atlas.loading'),
        errorText: t('atlas.error'),
        emptyText: t('atlas.noModules'),
        getModulesCountText: (count: number) => t('atlas.modulesCount', { count }),
      }}
      accentColor={ACCENT_COLOR}
      background={<DotsBackground />}
      icon={BookOpen}
    />
  );
}
