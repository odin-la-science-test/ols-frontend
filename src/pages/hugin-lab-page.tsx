import { FlaskConical } from 'lucide-react';
import { GridsBackground } from '@/components/common';
import { DashboardPageTemplate } from '@/components/modules/layout/dashboard-page-template';
import { useTranslation } from 'react-i18next';

// Couleur accent Hugin Lab (vert emeraude)
import { HUGIN_PRIMARY } from '@/lib/accent-colors';
const ACCENT_COLOR = HUGIN_PRIMARY;

export function HuginLabPage() {
  const { t } = useTranslation();
  return (
    <DashboardPageTemplate
      category="HUGIN_LAB"
      translations={{
        titleText: t('lab.title'),
        subtitleText: t('lab.subtitle'),
        loadingText: t('lab.loading'),
        errorText: t('lab.error'),
        emptyText: t('lab.noModules'),
        getModulesCountText: (count: number) => t('lab.modulesCount', { count }),
      }}
      accentColor={ACCENT_COLOR}
      background={<GridsBackground />}
      icon={FlaskConical}
    />
  );
}
