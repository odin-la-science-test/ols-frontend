import { useTranslation } from 'react-i18next';
import { PanelTop } from 'lucide-react';
import { FormSection } from '@/components/modules/shared';
import { useWorkspaceStore } from '@/stores';
import { ToggleRow } from './toggle-row';

// ─── Menu Bar Section ───

export function MenuBarSection() {
  const { t } = useTranslation();
  const { menuBarVisible, toggleMenuBar } = useWorkspaceStore();

  return (
    <FormSection
      id="menu-bar"
      title={t('settingsPage.menuBarSection')}
      description={t('settingsPage.menuBarSectionDesc')}
      icon={PanelTop}
      delay={5.6}
    >
      <ToggleRow
        icon={<PanelTop className="w-4 h-4" />}
        label={t('settingsPage.showMenuBar')}
        description={t('settingsPage.showMenuBarDesc')}
        checked={menuBarVisible}
        onChange={toggleMenuBar}
      />
    </FormSection>
  );
}
