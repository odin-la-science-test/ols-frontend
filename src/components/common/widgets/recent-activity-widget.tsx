import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { DashboardWidgetWrapper } from './widget-wrapper';
import { useWorkspaceStore } from '@/stores';
import { getIconComponent } from '@/lib/workspace-utils';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// RECENT ACTIVITY WIDGET - Shows recently visited modules
//
// Container-query responsive:
//   < @xs  → icon + truncated title only
//   >= @xs → full row with timestamp + arrow
// ═══════════════════════════════════════════════════════════════════════════

function formatRelativeTime(timestamp: number, t: (key: string) => string): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return t('dashboard.timeJustNow');
  if (minutes < 60) return t('dashboard.timeMinutes').replace('{{count}}', String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('dashboard.timeHours').replace('{{count}}', String(hours));
  const days = Math.floor(hours / 24);
  return t('dashboard.timeDays').replace('{{count}}', String(days));
}

export function RecentActivityWidget() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { recentModules } = useWorkspaceStore();

  // Filter out action-type recents, show only navigation
  const navRecents = recentModules
    .filter((r) => r.type !== 'action')
    .slice(0, 5);

  return (
    <DashboardWidgetWrapper id="recent-activity">
      <div className="flex flex-col h-full gap-2">
        <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 shrink-0">
          <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="hidden @3xs:inline">{t('dashboard.widgets.recentActivity')}</span>
        </h3>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
          {navRecents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/60">
              <Clock className="w-6 h-6 mb-2 opacity-40" />
              <p className="text-xs">{t('dashboard.noRecentActivity')}</p>
            </div>
          ) : (
            <div className="grid auto-rows-fr gap-0.5 h-full">
              {navRecents.map((recent) => (
                <button
                  key={`${recent.path}-${recent.timestamp}`}
                  onClick={() => navigate(recent.path)}
                  className={cn(
                    'w-full flex items-center gap-2 @xs:gap-2.5 px-2 @xs:px-2.5 rounded-lg text-left',
                    'text-muted-foreground hover:text-foreground',
                    'hover:bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)] transition-all duration-150 group'
                  )}
                >
                  <span className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                    {getIconComponent(recent.icon, 'w-3.5 h-3.5')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{recent.title}</p>
                  </div>
                  <span className="hidden @xs:inline text-[10px] text-muted-foreground/50 shrink-0">
                    {formatRelativeTime(recent.timestamp, t)}
                  </span>
                  <ArrowRight className="hidden @xs:block w-3 h-3 opacity-0 group-hover:opacity-50 -translate-x-1 group-hover:translate-x-0 transition-all shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardWidgetWrapper>
  );
}
