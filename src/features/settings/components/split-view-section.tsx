import { useTranslation } from 'react-i18next';
import { Columns2 } from 'lucide-react';
import { FormSection } from '@/components/modules/shared';
import { useEditorGroupsStore } from '@/stores/editor-groups-store';
import { ToggleRow } from './toggle-row';

// ─── Split View Section ───

export function SplitViewSection() {
  const { t } = useTranslation();
  const { splitActive, toggleSplit } = useEditorGroupsStore();

  return (
    <FormSection
      id="split-view"
      title={t('settingsPage.splitView')}
      description={t('settingsPage.splitViewDesc')}
      icon={Columns2}
      delay={5.8}
    >
      <ToggleRow
        icon={<Columns2 className="w-4 h-4" />}
        label={t('settingsPage.enableSplitView')}
        description={t('settingsPage.enableSplitViewDesc')}
        checked={splitActive}
        onChange={toggleSplit}
      />
    </FormSection>
  );
}
