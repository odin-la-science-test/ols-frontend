import { useMemo } from 'react';
import { useDashboardStore } from '@/stores/dashboard-store';
import type { WidgetSettingDef } from '@/lib/module-registry/types';

/**
 * Returns the resolved settings for a widget, merging stored values with defaults.
 *
 * Usage in a widget:
 * ```ts
 * const settings = useWidgetSettings('quick-shortcuts', SETTINGS_DEFS);
 * const iconOnly = settings.iconOnly as boolean;
 * ```
 */
export function useWidgetSettings(
  widgetId: string,
  defs: WidgetSettingDef[] = [],
): Record<string, unknown> {
  const stored = useDashboardStore((s) => s.widgetSettings[widgetId]);

  return useMemo(() => {
    const resolved: Record<string, unknown> = {};
    for (const def of defs) {
      resolved[def.key] = stored?.[def.key] ?? def.defaultValue;
    }
    return resolved;
  }, [stored, defs]);
}
