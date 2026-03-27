import { useTranslation } from 'react-i18next';
import { Navigation } from 'lucide-react';
import { FormSection } from '@/components/modules/shared';
import { useWorkspaceStore } from '@/stores';
import { ToggleRow } from './toggle-row';

// ─── Navigation Section ───

export function NavigationSection() {
  const { t } = useTranslation();
  const { showBreadcrumbs, toggleBreadcrumbs } = useWorkspaceStore();

  return (
    <FormSection
      id="navigation"
      title={t('settingsPage.navigation')}
      description={t('settingsPage.navigationDesc')}
      icon={Navigation}
      delay={5}
    >
      <ToggleRow
        icon={<Navigation className="w-4 h-4" />}
        label={t('settingsPage.showBreadcrumbs')}
        description={t('settingsPage.showBreadcrumbsDesc')}
        checked={showBreadcrumbs}
        onChange={toggleBreadcrumbs}
      />
    </FormSection>
  );
}
