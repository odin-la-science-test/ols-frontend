import { useTranslation } from 'react-i18next';
import { Layers, PanelLeft, PanelRight, Check } from 'lucide-react';
import { Label } from '@/components/ui';
import { FormSection } from '@/components/modules/shared';
import { cn } from '@/lib/utils';
import { useSidebarModeStore, type SidebarMode } from '@/stores/sidebar-mode-store';

// ─── Sidebar Mode Section ───

export function SidebarModeSection() {
  const { t } = useTranslation();
  const { primaryMode: primarySidebarMode, secondaryMode: secondarySidebarMode, setPrimaryMode: setPrimarySidebarMode, setSecondaryMode: setSecondarySidebarMode } = useSidebarModeStore();

  return (
    <FormSection
      id="sidebar-mode"
      title={t('settingsPage.sidebarMode')}
      description={t('settingsPage.sidebarModeDesc')}
      icon={Layers}
      delay={5.65}
    >
      {/* Primary sidebar mode */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <PanelLeft className="w-4 h-4 text-muted-foreground" />
          <Label className="text-xs font-medium text-muted-foreground">
            {t('settingsPage.primarySidebarMode')}
          </Label>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-2">{t('settingsPage.primarySidebarModeDesc')}</p>
        <div className="flex gap-1">
          {([
            { value: 'dock' as SidebarMode, icon: PanelLeft, label: t('settingsPage.sidebarModeDock') },
            { value: 'overlay' as SidebarMode, icon: Layers, label: t('settingsPage.sidebarModeOverlay') },
          ]).map((opt) => {
            const Icon = opt.icon;
            const isSelected = primarySidebarMode === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setPrimarySidebarMode(opt.value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-150 min-w-[72px]',
                  isSelected
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
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

      {/* Secondary sidebar mode */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <PanelRight className="w-4 h-4 text-muted-foreground" />
          <Label className="text-xs font-medium text-muted-foreground">
            {t('settingsPage.secondarySidebarMode')}
          </Label>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-2">{t('settingsPage.secondarySidebarModeDesc')}</p>
        <div className="flex gap-1">
          {([
            { value: 'dock' as SidebarMode, icon: PanelRight, label: t('settingsPage.sidebarModeDock') },
            { value: 'overlay' as SidebarMode, icon: Layers, label: t('settingsPage.sidebarModeOverlay') },
          ]).map((opt) => {
            const Icon = opt.icon;
            const isSelected = secondarySidebarMode === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSecondarySidebarMode(opt.value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-150 min-w-[72px]',
                  isSelected
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
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
