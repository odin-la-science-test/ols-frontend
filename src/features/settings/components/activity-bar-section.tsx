import { useTranslation } from 'react-i18next';
import {
  LayoutGrid,
  RotateCcw,
  Check,
  PanelLeft,
  PanelTop,
  PanelRight,
  PanelBottom,
} from 'lucide-react';
import { Label } from '@/components/ui';
import { FormSection } from '@/components/modules/shared';
import { cn } from '@/lib/utils';
import { useActivityBarStore, type ActivityBarPosition } from '@/stores';
import { toast } from '@/hooks';
import { ToggleRow } from './toggle-row';
import { ActivityBarItemRow } from './activity-bar-item-row';

// ─── Activity Bar Section ───

export function ActivityBarSection() {
  const { t } = useTranslation();
  const {
    activityBarVisible,
    toggleActivityBar,
    items: activityBarItems,
    setItemVisible,
    resetToDefaults: resetActivityBar,
    position: activityBarPosition,
    setPosition: setActivityBarPosition,
  } = useActivityBarStore();

  return (
    <FormSection
      id="activity-bar"
      title={t('settingsPage.activityBar')}
      description={t('settingsPage.activityBarDesc')}
      icon={LayoutGrid}
      delay={6}
    >
      <div className="space-y-4">
        {/* Toggle visibility */}
        <ToggleRow
          icon={<LayoutGrid className="w-4 h-4" />}
          label={t('settingsPage.showActivityBar')}
          description={t('settingsPage.showActivityBarDesc')}
          checked={activityBarVisible}
          onChange={toggleActivityBar}
        />

        {/* Position selector */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-xs font-medium text-muted-foreground">
              {t('settingsPage.activityBarPosition')}
            </Label>
          </div>
          <div className="flex gap-1">
            {([
              { value: 'left' as ActivityBarPosition, icon: PanelLeft, label: t('activityBar.positionLeft') },
              { value: 'top' as ActivityBarPosition, icon: PanelTop, label: t('activityBar.positionTop') },
              { value: 'right' as ActivityBarPosition, icon: PanelRight, label: t('activityBar.positionRight') },
              { value: 'bottom' as ActivityBarPosition, icon: PanelBottom, label: t('activityBar.positionBottom') },
            ]).map((opt) => {
              const Icon = opt.icon;
              const isSelected = activityBarPosition === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setActivityBarPosition(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-150 min-w-[72px]',
                    isSelected
                      ? 'bg-muted/40 text-foreground'
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

        {/* Items visibility */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">
              {t('settingsPage.activityBarItems')}
            </Label>
            <button
              onClick={() => {
                resetActivityBar();
                toast({ title: t('settingsPage.activityBarReset') });
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              {t('settingsPage.resetDefaults')}
            </button>
          </div>
          {activityBarItems.map((item) => (
            <ActivityBarItemRow
              key={item.id}
              id={item.id}
              icon={item.icon}
              visible={item.visible}
              onToggle={() => setItemVisible(item.id, !item.visible)}
            />
          ))}
        </div>
      </div>
    </FormSection>
  );
}
