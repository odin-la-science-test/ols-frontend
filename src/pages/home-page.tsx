import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, BookOpen, Pencil, X, RotateCcw, Eye, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SparklesBackground, FeatureCard, AppTopBar } from '@/components/common';
import {
  QuickShortcutsWidget,
  RecentActivityWidget,
  LatestNotesWidget,
  NotificationsWidget,
} from '@/components/common/widgets';
import { useDashboardStore, type WidgetId } from '@/stores/dashboard-store';
import { MUNIN_PRIMARY, HUGIN_PRIMARY } from '@/lib/accent-colors';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════
// HOME PAGE - Customizable Dashboard with drag & drop widget grid
// Uses @dnd-kit for 2D grid reordering in edit mode
// ═══════════════════════════════════════════════════════════════════════

const WIDGET_COMPONENTS: Record<WidgetId, React.FC> = {
  'quick-shortcuts': QuickShortcutsWidget,
  'recent-activity': RecentActivityWidget,
  'latest-notes': LatestNotesWidget,
  'notifications': NotificationsWidget,
};

const WIDGET_LABEL_KEYS: Record<WidgetId, string> = {
  'quick-shortcuts': 'dashboard.widgets.quickShortcuts',
  'recent-activity': 'dashboard.widgets.recentActivity',
  'latest-notes': 'dashboard.widgets.latestNotes',
  'notifications': 'dashboard.widgets.notifications',
};

// ─── Sortable Widget Item ───────────────────────────────────────────────

function SortableWidget({
  id,
  editMode,
  visible,
}: {
  id: WidgetId;
  editMode: boolean;
  visible: boolean;
}) {
  const { t } = useTranslation();
  const { setWidgetVisible } = useDashboardStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !editMode });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.15 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const WidgetComponent = WIDGET_COMPONENTS[id];

  // Hidden widget placeholder (edit mode only)
  if (!visible) {
    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <div className="relative rounded-xl border-2 border-dashed border-border/50 bg-muted/20 backdrop-blur-sm p-6 flex items-center justify-between gap-3 min-h-[80px]">
          <span className="text-xs text-muted-foreground">
            {t(WIDGET_LABEL_KEYS[id])}
          </span>
          <button
            onClick={() => setWidgetVisible(id, true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            {t('dashboard.showWidget')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Edit mode overlay with drag handle */}
      {editMode && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-1 rounded-lg bg-muted/30 border border-border/20">
          {/* Drag handle */}
          <div
            {...listeners}
            className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{t(WIDGET_LABEL_KEYS[id])}</span>
          </div>
          <button
            onClick={() => setWidgetVisible(id, false)}
            className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <WidgetComponent />
    </div>
  );
}

// ─── Widget Drag Overlay (ghost shown while dragging) ───────────────────

function WidgetDragOverlay({ id }: { id: WidgetId }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border bg-popover shadow-lg px-4 py-3 min-h-[60px] flex items-center gap-2">
      <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-xs font-medium text-foreground">
        {t(WIDGET_LABEL_KEYS[id])}
      </span>
    </div>
  );
}

// ─── Home Page ──────────────────────────────────────────────────────────

export function HomePage() {
  const { t } = useTranslation();
  const { widgets, editMode, toggleEditMode, resetToDefaults, reorderWidgets } = useDashboardStore();
  const [activeId, setActiveId] = React.useState<WidgetId | null>(null);

  // In edit mode show ALL widgets; otherwise only visible
  const displayWidgets = editMode ? widgets : widgets.filter((w) => w.visible);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as WidgetId);
  }, []);

  const handleDragEnd = React.useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = widgets.findIndex((w) => w.id === active.id);
    const newIndex = widgets.findIndex((w) => w.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = [...widgets];
    const [moved] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, moved);
    reorderWidgets(newOrder.map((w) => w.id));
  }, [widgets, reorderWidgets]);

  const widgetIds = displayWidgets.map((w) => w.id);

  return (
    <div className="h-[100dvh] flex flex-col relative overflow-hidden">
      <SparklesBackground />
      <AppTopBar />

      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-thin pb-20 lg:pb-6">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
          {/* Platform Cards */}
          <motion.div
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

          {/* Widget Grid with DnD */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {editMode ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayWidgets.map((widget) => (
                      <SortableWidget
                        key={widget.id}
                        id={widget.id}
                        editMode={editMode}
                        visible={widget.visible}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
                  {activeId ? <WidgetDragOverlay id={activeId} /> : null}
                </DragOverlay>
              </DndContext>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {displayWidgets.map((widget) => {
                    const WidgetComponent = WIDGET_COMPONENTS[widget.id];
                    return (
                      <motion.div
                        key={widget.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12, scale: 0.95 }}
                      >
                        <WidgetComponent />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Empty state */}
          {!editMode && displayWidgets.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-16 text-muted-foreground/50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              <p className="text-sm">{t('dashboard.noWidgets')}</p>
              <button onClick={toggleEditMode} className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors">
                {t('dashboard.customize')}
              </button>
            </motion.div>
          )}

          {/* Toolbar */}
          <motion.div
            className="flex items-center justify-center gap-3 mt-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <button
              onClick={toggleEditMode}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                editMode
                  ? 'bg-primary/15 text-primary border border-primary/30 backdrop-blur-sm'
                  : 'bg-background/60 backdrop-blur-sm text-muted-foreground/60 hover:text-muted-foreground hover:bg-background/80 border border-border/30',
              )}
            >
              {editMode ? <><X className="w-3.5 h-3.5" />{t('dashboard.doneEditing')}</> : <><Pencil className="w-3.5 h-3.5" />{t('dashboard.customize')}</>}
            </button>
            {editMode && (
              <button
                onClick={resetToDefaults}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-background/60 backdrop-blur-sm text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 border border-border/30 transition-all duration-150"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('dashboard.reset')}
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
