import { lazy, type ComponentType } from 'react';
import type { ModuleWidget } from '@/lib/module-registry/types';
import { QuickShortcutsWidget } from '@/components/common/widgets';
import { RecentActivityWidget } from '@/components/common/widgets';
import { registry } from '@/lib/module-registry';

const LazyProgressWidget = lazy(() =>
  import('@/components/common/widgets/progress-widget').then((m) => ({ default: m.ProgressWidget as ComponentType })),
);

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM WIDGETS — System-level dashboard widgets (not tied to a module)
//
// Module-specific widgets are declared in each module's definition.ts
// via the `widgets` field. This file provides the platform widgets
// and a utility to collect ALL widgets from both sources.
// ═══════════════════════════════════════════════════════════════════════════

export const PLATFORM_WIDGETS: ModuleWidget[] = [
  {
    id: 'quick-shortcuts',
    titleKey: 'dashboard.widgets.quickShortcuts',
    icon: 'zap',
    component: QuickShortcutsWidget,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 5 },
    defaultVisible: true,
    settings: [
      { key: 'iconOnly', type: 'boolean', labelKey: 'dashboard.settings.iconOnly', defaultValue: false },
    ],
  },
  {
    id: 'recent-activity',
    titleKey: 'dashboard.widgets.recentActivity',
    icon: 'clock',
    component: RecentActivityWidget,
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 6, h: 6 },
    defaultVisible: true,
  },
  {
    id: 'progress',
    titleKey: 'progress.widget.title',
    icon: 'bar-chart-3',
    component: LazyProgressWidget,
    defaultSize: { w: 2, h: 4 },
    defaultVisible: true,
  },
];

/** Collect all dashboard widgets: platform + module-declared */
export function getAllDashboardWidgets(): ModuleWidget[] {
  const moduleWidgets = registry.getWidgets().flatMap(({ widgets }) => widgets);
  return [...PLATFORM_WIDGETS, ...moduleWidgets];
}
