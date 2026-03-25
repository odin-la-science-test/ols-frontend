import { useTranslation } from 'react-i18next';
import { Keyboard, AlertTriangle, RotateCcw } from 'lucide-react';
import { FormSection } from '@/components/modules/shared';
import { useKeybindingsStore } from '@/stores/keybindings-store';
import { toast } from '@/hooks';
import { KeybindingCategory } from './keybinding-category';

// ─── Keybindings Section ───

export function KeybindingsSection() {
  const { t } = useTranslation();
  const {
    bindings,
    getEffectiveCombo,
    setKeybinding,
    resetKeybinding,
    resetAll: resetAllKeybindings,
    getConflicts,
    isCustomized,
    recordingActionId,
    startRecording,
    stopRecording,
  } = useKeybindingsStore();
  const conflicts = getConflicts();

  return (
    <FormSection
      id="keybindings"
      title={t('settingsPage.keybindings')}
      description={t('settingsPage.keybindingsDesc')}
      icon={Keyboard}
      delay={7}
    >
      <div className="space-y-4">
        {/* Conflicts warning */}
        {conflicts.length > 0 && (
          <div className="flex items-start gap-3 p-3 rounded-lg border border-warning/40 bg-warning/5">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-medium text-warning">{t('settingsPage.keybindingsConflict')}</p>
              <p className="text-muted-foreground mt-0.5">{t('settingsPage.keybindingsConflictDesc')}</p>
            </div>
          </div>
        )}

        {/* Category: Navigation */}
        <KeybindingCategory
          label={t('settingsPage.keybindingsCatNavigation')}
          bindings={bindings.filter((b) => b.category === 'navigation')}
          getEffectiveCombo={getEffectiveCombo}
          isCustomized={isCustomized}
          recordingActionId={recordingActionId}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onSetKeybinding={setKeybinding}
          onResetKeybinding={resetKeybinding}
          conflicts={conflicts}
        />

        {/* Category: Layout */}
        <KeybindingCategory
          label={t('settingsPage.keybindingsCatLayout')}
          bindings={bindings.filter((b) => b.category === 'layout')}
          getEffectiveCombo={getEffectiveCombo}
          isCustomized={isCustomized}
          recordingActionId={recordingActionId}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onSetKeybinding={setKeybinding}
          onResetKeybinding={resetKeybinding}
          conflicts={conflicts}
        />

        {/* Category: Tabs */}
        <KeybindingCategory
          label={t('settingsPage.keybindingsCatTabs')}
          bindings={bindings.filter((b) => b.category === 'tabs')}
          getEffectiveCombo={getEffectiveCombo}
          isCustomized={isCustomized}
          recordingActionId={recordingActionId}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onSetKeybinding={setKeybinding}
          onResetKeybinding={resetKeybinding}
          conflicts={conflicts}
        />

        {/* Reset all button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              resetAllKeybindings();
              toast({ title: t('settingsPage.keybindingsReset') });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border border-border/40"
          >
            <RotateCcw className="w-3 h-3" />
            {t('settingsPage.keybindingsResetAll')}
          </button>
        </div>
      </div>
    </FormSection>
  );
}
