import { useTranslation } from 'react-i18next';
import {
  Activity,
  Check,
  PanelBottomClose,
  PanelLeft,
  PanelRight,
  AlignVerticalJustifyCenter,
} from 'lucide-react';
import { Label } from '@/components/ui';
import { FormSection } from '@/components/modules/shared';
import { cn } from '@/lib/utils';
import { useBottomPanelStore } from '@/stores/bottom-panel-store';
import type { BottomPanelAlignment } from '@/stores/bottom-panel-store';
import { ToggleRow } from './toggle-row';

// ─── Bottom Panel Section ───

export function BottomPanelSection() {
  const { t } = useTranslation();
  const { visible: bottomPanelVisible, toggleVisible: toggleBottomPanel, alignment: panelAlignment, setAlignment: setPanelAlignment } = useBottomPanelStore();

  return (
    <FormSection
      id="bottom-panel"
      title={t('settingsPage.bottomPanel')}
      description={t('settingsPage.bottomPanelDesc')}
      icon={Activity}
      delay={5.7}
    >
      <ToggleRow
        icon={<Activity className="w-4 h-4" />}
        label={t('settingsPage.showBottomPanel')}
        description={t('settingsPage.showBottomPanelDesc')}
        checked={bottomPanelVisible}
        onChange={toggleBottomPanel}
      />

      {/* Alignment selector */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-muted-foreground">
            {t('settingsPage.panelAlignment')}
          </Label>
        </div>
        <div className="flex gap-1">
          {([
            { value: 'center' as BottomPanelAlignment, icon: PanelBottomClose, label: t('bottomPanel.alignCenter') },
            { value: 'left' as BottomPanelAlignment, icon: PanelLeft, label: t('bottomPanel.alignLeft') },
            { value: 'right' as BottomPanelAlignment, icon: PanelRight, label: t('bottomPanel.alignRight') },
            { value: 'justify' as BottomPanelAlignment, icon: AlignVerticalJustifyCenter, label: t('bottomPanel.alignJustify') },
          ]).map((opt) => {
            const Icon = opt.icon;
            const isSelected = panelAlignment === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setPanelAlignment(opt.value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-150 min-w-[72px]',
                  isSelected
                    ? 'bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)] text-foreground'
                    : 'text-muted-foreground hover:bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)] hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{opt.label}</span>
                {isSelected && <Check className={'w-3 h-3 text-[var(--module-accent)]'} />}
              </button>
            );
          })}
        </div>
      </div>
    </FormSection>
  );
}
