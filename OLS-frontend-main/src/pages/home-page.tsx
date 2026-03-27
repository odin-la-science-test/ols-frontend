import { useCallback, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, BookOpen, Pencil, X, RotateCcw, Eye, GripVertical, Settings } from 'lucide-react';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import type { Layout, ResponsiveLayouts } from 'react-grid-layout';
import { SparklesBackground, FeatureCard, AppTopBar } from '@/components/common';
import { Button } from '@/components/ui';
import {
  useDashboardStore,
  generateDefaultLayouts,
  GRID_BREAKPOINTS,
  GRID_COLS,
  GRID_ROW_HEIGHT,
} from '@/stores/dashboard-store';
import { WidgetSettingsPanel } from '@/components/common/widgets/widget-settings-panel';
import { MUNIN_PRIMARY, HUGIN_PRIMARY } from '@/lib/accent-colors';
import { cn } from '@/lib/utils';
import { getAllDashboardWidgets } from '@/lib/platform-widgets';
import type { ModuleWidget } from '@/lib/module-registry/types';

// ═══════════════════════════════════════════════════════════════════════
// HOME PAGE - Customizable Dashboard with react-grid-layout v2
// Widgets are drag-and-drop + freely resizable in edit mode
//
// Widgets are collected dynamically from:
// - Platform widgets (src/lib/platform-widgets.ts)
// - Module-declared widgets (each module's definition.ts → widgets field)
// ═══════════════════════════════════════════════════════════════════════

// ─── Widget Edit Overlay (drag handle + settings + hide) ────────────────

function WidgetEditOverlay({
  id,
  titleKey,
  hasSettings,
  settingsOpen,
  onToggleSettings,
}: {
  id: string;
  titleKey: string;
  hasSettings: boolean;
  settingsOpen: boolean;
  onToggleSettings: () => void;
}) {
  const { t } = useTranslation();
  const { setWidgetVisible } = useDashboardStore();

  return (
    <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-3 py-1.5 pointer-events-none">
      <div className="widget-drag-handle pointer-events-auto flex items-center gap-1.5 px-1.5 py-0.5 rounded-md cursor-grab active:cursor-grabbing text-muted-foreground/70 hover:text-foreground glass-muted transition-colors">
        <GripVertical className="w-3 h-3" />
        <span className="text-[10px] font-medium">{t(titleKey)}</span>
      </div>
      <div className="pointer-events-auto flex items-center gap-0.5">
        {hasSettings && (
          <button
            onClick={onToggleSettings}
            className={cn(
              'p-1 rounded-md backdrop-blur-sm transition-colors',
              settingsOpen
                ? 'bg-primary/15 text-primary'
                : 'bg-muted/40 text-muted-foreground/70 hover:text-foreground'
            )}
          >
            <Settings className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => setWidgetVisible(id, false)}
          className="p-1 rounded-md glass-muted text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Hidden Widgets Panel (edit mode) ───────────────────────────────────

function HiddenWidgetsPanel({ widgetMap }: { widgetMap: Map<string, ModuleWidget> }) {
  const { t } = useTranslation();
  const { widgets, setWidgetVisible } = useDashboardStore();
  const hiddenWidgets = widgets.filter((w) => !w.visible);

  if (hiddenWidgets.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs text-muted-foreground/60 font-medium">{t('dashboard.hiddenWidgets')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {hiddenWidgets.map((widget) => {
          const def = widgetMap.get(widget.id);
          if (!def) return null;
          return (
            <div
              key={widget.id}
              className="relative rounded-xl border-2 border-dashed border-border/50 glass-muted p-4 flex items-center justify-between gap-3"
            >
              <span className="text-xs text-muted-foreground">{t(def.titleKey)}</span>
              <button
                onClick={() => setWidgetVisible(widget.id, true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                {t('dashboard.showWidget')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Home Page ──────────────────────────────────────────────────────────

export function HomePage() {
  const { t } = useTranslation();
  const { widgets, layouts, editMode, toggleEditMode, resetToDefaults, updateLayouts } = useDashboardStore();
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1024 });
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);

  // Collect all widgets from platform + registry
  const allWidgets = useMemo(() => getAllDashboardWidgets(), []);
  const widgetMap = useMemo(() => new Map(allWidgets.map((w) => [w.id, w])), [allWidgets]);

  // Merge definitions with stored preferences: stored prefs win, else defaultVisible
  const prefsMap = useMemo(() => new Map(widgets.map((w) => [w.id, w.visible])), [widgets]);
  const visibleWidgets = useMemo(
    () => allWidgets
      .filter((def) => prefsMap.has(def.id) ? prefsMap.get(def.id) : def.defaultVisible)
      .map((def) => ({ id: def.id, visible: true })),
    [allWidgets, prefsMap],
  );

  // Compute effective layouts: use stored layouts if available, otherwise generate defaults
  const effectiveLayouts = useMemo(() => {
    const visibleDefs = visibleWidgets
      .map((w) => widgetMap.get(w.id))
      .filter(Boolean) as ModuleWidget[];

    const defaults = generateDefaultLayouts(visibleDefs);

    if (!layouts || Object.keys(layouts).length === 0) {
      return defaults;
    }

    // Filter stored layouts to only include visible widget ids
    const visibleIds = new Set(visibleWidgets.map((w) => w.id));
    const filtered: ResponsiveLayouts = {};

    for (const [bp, layoutItems] of Object.entries(layouts)) {
      if (layoutItems) {
        filtered[bp] = [...layoutItems].filter((item) => visibleIds.has(item.i));
      }
    }

    // Add any new visible widgets that aren't in the stored layouts
    for (const [bp, defaultItems] of Object.entries(defaults)) {
      if (!defaultItems) continue;
      const existingIds = new Set((filtered[bp] ?? []).map((item) => item.i));
      const missing = [...defaultItems].filter((item) => !existingIds.has(item.i));
      filtered[bp] = [...(filtered[bp] ?? []), ...missing];
    }

    return filtered;
  }, [layouts, visibleWidgets, widgetMap]);

  const isDraggable = editMode;
  const isResizable = editMode;

  const handleLayoutChange = useCallback(
    (_layout: Layout, allLayouts: ResponsiveLayouts) => {
      updateLayouts(allLayouts);
    },
    [updateLayouts],
  );

  // Close settings panel when leaving edit mode
  const handleToggleEdit = useCallback(() => {
    setOpenSettingsId(null);
    toggleEditMode();
  }, [toggleEditMode]);

  return (
    <div className="h-[100dvh] flex flex-col relative overflow-hidden">
      <SparklesBackground />
      <AppTopBar />

      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-thin pb-20 lg:pb-6">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
          {/* Platform Cards */}
          <motion.div
            data-tour="platform-cards"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <FeatureCard
              to="/atlas"
              icon={<BookOpen className="w-5 h-5" strokeWidth={1.5} />}
              title={t('atlas.title')}
              description={t('home.atlasDescription')}
              accentColor={MUNIN_PRIMARY}
              delay={0.1}
              compact
              hoverColoredBg
            />
            <FeatureCard
              to="/lab"
              icon={<FlaskConical className="w-5 h-5" strokeWidth={1.5} />}
              title={t('home.huginLab')}
              description={t('home.labDescription')}
              accentColor={HUGIN_PRIMARY}
              delay={0.2}
              compact
              hoverColoredBg
            />
          </motion.div>

          {/* Widget Grid */}
          <div ref={containerRef} data-tour="dashboard-grid" className={cn(editMode && 'dashboard-edit-mode')}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {visibleWidgets.length > 0 && mounted ? (
              <ResponsiveGridLayout
                width={width}
                layouts={effectiveLayouts}
                breakpoints={GRID_BREAKPOINTS}
                cols={GRID_COLS}
                rowHeight={GRID_ROW_HEIGHT}
                dragConfig={{ enabled: isDraggable, handle: '.widget-drag-handle' }}
                resizeConfig={{ enabled: isResizable }}
                onLayoutChange={handleLayoutChange}
                containerPadding={[0, 0]}
                margin={[16, 16]}
              >
                {visibleWidgets.map((widget) => {
                  const def = widgetMap.get(widget.id);
                  if (!def) return null;
                  const WidgetComponent = def.component;
                  const hasSettings = (def.settings?.length ?? 0) > 0;
                  const settingsOpen = openSettingsId === widget.id;
                  return (
                    <div key={widget.id} className={cn('h-full relative', editMode && 'pt-7')}>
                      {editMode && (
                        <>
                          <WidgetEditOverlay
                            id={widget.id}
                            titleKey={def.titleKey}
                            hasSettings={hasSettings}
                            settingsOpen={settingsOpen}
                            onToggleSettings={() => setOpenSettingsId(settingsOpen ? null : widget.id)}
                          />
                          {settingsOpen && def.settings && (
                            <div className="absolute inset-x-3 top-8 z-20">
                              <WidgetSettingsPanel widgetId={widget.id} settings={def.settings} />
                            </div>
                          )}
                        </>
                      )}
                      <div className="h-full">
                        <WidgetComponent />
                      </div>
                    </div>
                  );
                })}
              </ResponsiveGridLayout>
            ) : (
              !editMode && visibleWidgets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
                  <p className="text-sm">{t('dashboard.noWidgets')}</p>
                  <button onClick={handleToggleEdit} className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors">
                    {t('dashboard.customize')}
                  </button>
                </div>
              )
            )}

            {/* Hidden widgets panel (edit mode only) */}
            <AnimatePresence>
              {editMode && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                >
                  <HiddenWidgetsPanel widgetMap={widgetMap} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          </div>

          {/* Toolbar */}
          <motion.div
            data-tour="dashboard-toolbar"
            className="flex items-center justify-center gap-3 mt-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <Button
              variant={editMode ? 'outline' : 'ghost'}
              size="sm"
              onClick={handleToggleEdit}
              className="backdrop-blur-sm"
            >
              {editMode ? <><X className="w-3.5 h-3.5" />{t('dashboard.doneEditing')}</> : <><Pencil className="w-3.5 h-3.5" />{t('dashboard.customize')}</>}
            </Button>
            {editMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDefaults}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 backdrop-blur-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('dashboard.reset')}
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
