import { useTranslation } from 'react-i18next';
import { Maximize } from 'lucide-react';
import { FormSection } from '@/components/modules/shared';
import { useWorkspaceStore } from '@/stores';
import { ToggleRow } from './toggle-row';

// ─── Focus Mode Section ───

export function FocusSection() {
  const { t } = useTranslation();
  const { focusMode, toggleFocusMode } = useWorkspaceStore();

  return (
    <FormSection
      id="focus"
      title={t('settingsPage.focusMode')}
      description={t('settingsPage.focusModeDesc')}
      icon={Maximize}
      delay={4}
    >
      <ToggleRow
        icon={<Maximize className="w-4 h-4" />}
        label={t('settingsPage.enableFocusMode')}
        description={t('settingsPage.enableFocusModeDesc')}
        checked={focusMode}
        onChange={toggleFocusMode}
      />
    </FormSection>
  );
}
