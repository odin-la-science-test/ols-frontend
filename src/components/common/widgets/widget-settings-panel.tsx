import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '@/stores/dashboard-store';
import { useWidgetSettings } from '@/hooks/use-widget-settings';
import type { WidgetSettingDef } from '@/lib/module-registry/types';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// WIDGET SETTINGS PANEL — Generic settings UI for any widget
//
// Renders controls based on WidgetSettingDef[]:
//   - boolean → toggle switch
//   - select  → segmented control
//
// This component is rendered inside the widget's grid cell when the user
// clicks the settings gear in edit mode.
// ═══════════════════════════════════════════════════════════════════════════

interface WidgetSettingsPanelProps {
  widgetId: string;
  settings: WidgetSettingDef[];
}

export function WidgetSettingsPanel({ widgetId, settings }: WidgetSettingsPanelProps) {
  const { t } = useTranslation();
  const updateSetting = useDashboardStore((s) => s.updateWidgetSetting);
  const resolved = useWidgetSettings(widgetId, settings);

  if (settings.length === 0) return null;

  return (
    <div className="space-y-2 p-2 rounded-lg bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl">
      {settings.map((def) => (
        <div key={def.key} className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-muted-foreground">{t(def.labelKey)}</span>

          {def.type === 'boolean' && (
            <button
              onClick={() => updateSetting(widgetId, def.key, !resolved[def.key])}
              className={cn(
                'relative w-8 h-[18px] rounded-full transition-colors duration-200 shrink-0',
                resolved[def.key] ? 'bg-primary' : 'bg-muted-foreground/30'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200',
                  !!resolved[def.key] && 'translate-x-[14px]'
                )}
              />
            </button>
          )}

          {def.type === 'select' && (
            <div className="flex gap-0.5 bg-muted/40 rounded-md p-0.5">
              {def.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateSetting(widgetId, def.key, opt.value)}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-medium transition-colors',
                    resolved[def.key] === opt.value
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground/60 hover:text-muted-foreground'
                  )}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
