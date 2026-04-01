import { useTranslation } from 'react-i18next';
import { PanelBottom } from 'lucide-react';
import { FormSection } from '@/components/modules/shared';
import { useWorkspaceStore } from '@/stores';
import { ToggleRow } from './toggle-row';

// ─── Status Bar Section ───

export function StatusBarSection() {
  const { t } = useTranslation();
  const { statusBarVisible, toggleStatusBar } = useWorkspaceStore();

  return (
    <FormSection
      id="status-bar"
      title={t('settingsPage.statusBar')}
      description={t('settingsPage.statusBarDesc')}
      icon={PanelBottom}
      delay={5.5}
    >
      <ToggleRow
        icon={<PanelBottom className="w-4 h-4" />}
        label={t('settingsPage.showStatusBar')}
        description={t('settingsPage.showStatusBarDesc')}
        checked={statusBarVisible}
        onChange={toggleStatusBar}
      />
    </FormSection>
  );
}
