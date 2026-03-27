import { useTranslation } from 'react-i18next';
import { BarChart3, Boxes, FlaskConical } from 'lucide-react';
import { DashboardWidgetWrapper } from './widget-wrapper';
import { useProgressStore } from '@/stores/progress-store';
import { registry } from '@/lib/module-registry';

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS WIDGET — Shows learning progress overview on the dashboard
// ═══════════════════════════════════════════════════════════════════════════

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="h-1.5 w-full rounded-full bg-muted/50">
      <div
        className="h-full rounded-full bg-foreground/40 transition-all duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground/60">{icon}</span>
      <span className="flex-1 text-xs text-muted-foreground truncate">{label}</span>
      <span className="text-xs font-medium tabular-nums">{value}</span>
    </div>
  );
}

export function ProgressWidget() {
  const { t } = useTranslation();
  const modulesVisited = useProgressStore((s) => s.modulesVisited);
  const entitiesCreated = useProgressStore((s) => s.entitiesCreated);
  const identificationsRun = useProgressStore((s) => s.identificationsRun);

  const totalModules = registry.size;
  const visitedCount = modulesVisited.size;

  return (
    <DashboardWidgetWrapper id="progress">
      <div className="flex flex-col h-full gap-3 p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <BarChart3 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <span>{t('progress.widget.title')}</span>
        </div>

        <div className="flex flex-col gap-3 flex-1 justify-center">
          {/* Modules explored — with progress bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {t('progress.widget.modulesExplored')}
              </span>
              <span className="text-xs font-medium tabular-nums">
                {visitedCount} / {totalModules}
              </span>
            </div>
            <ProgressBar value={visitedCount} max={totalModules} />
          </div>

          {/* Entities created */}
          <StatRow
            icon={<Boxes className="h-3.5 w-3.5" strokeWidth={1.5} />}
            label={t('progress.widget.entitiesCreated')}
            value={entitiesCreated}
          />

          {/* Identifications */}
          <StatRow
            icon={<FlaskConical className="h-3.5 w-3.5" strokeWidth={1.5} />}
            label={t('progress.widget.identifications')}
            value={identificationsRun}
          />
        </div>
      </div>
    </DashboardWidgetWrapper>
  );
}
