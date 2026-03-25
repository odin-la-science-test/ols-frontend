import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { StickyNote, Pin, ArrowRight } from 'lucide-react';
import { DashboardWidgetWrapper } from './widget-wrapper';
import { useMyNotes } from '@/features/notes';
import { cn } from '@/lib/utils';
import { registry } from '@/lib/module-registry';

// ═══════════════════════════════════════════════════════════════════════════
// LATEST NOTES WIDGET - Shows the most recent notes
//
// Container-query responsive:
//   < @xs  → compact: title only
//   >= @xs → full: title + content preview + tags
// ═══════════════════════════════════════════════════════════════════════════

const NOTE_COLORS: Record<string, string> = {
  blue: 'bg-blue-500/15 border-blue-500/30',
  red: 'bg-red-500/15 border-red-500/30',
  green: 'bg-emerald-500/15 border-emerald-500/30',
  yellow: 'bg-amber-500/15 border-amber-500/30',
  purple: 'bg-violet-500/15 border-violet-500/30',
  orange: 'bg-orange-500/15 border-orange-500/30',
};

export function LatestNotesWidget() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: notes, isLoading } = useMyNotes();

  // Sort by updatedAt desc, take 4
  const latestNotes = (notes ?? [])
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  return (
    <DashboardWidgetWrapper id="latest-notes">
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between shrink-0">
          <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <StickyNote className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden @3xs:inline">{t('dashboard.widgets.latestNotes')}</span>
          </h3>
          <button
            onClick={() => navigate(registry.getRoutePath('notes') ?? '/lab/notes')}
            className="hidden @xs:flex text-[10px] text-muted-foreground/60 hover:text-foreground items-center gap-0.5 transition-colors"
          >
            {t('dashboard.viewAll')}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 @xs:h-12 rounded-lg bg-[color-mix(in_srgb,var(--color-muted)_20%,transparent)] animate-pulse" />
              ))}
            </div>
          ) : latestNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/60">
              <StickyNote className="w-6 h-6 mb-2 opacity-40" />
              <p className="text-xs">{t('dashboard.noNotes')}</p>
            </div>
          ) : (
            <div className="grid auto-rows-auto gap-1">
              {latestNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => navigate(registry.getRoutePath('notes') ?? '/lab/notes')}
                  className={cn(
                    'w-full flex items-center gap-2 @xs:gap-2.5 px-2 @xs:px-2.5 py-1.5 @xs:py-2 rounded-lg text-left',
                    'hover:bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)] transition-all duration-150 group',
                    note.color ? NOTE_COLORS[note.color] ?? '' : ''
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-medium text-foreground truncate">{note.title}</p>
                      {note.pinned && (
                        <Pin className="w-2.5 h-2.5 text-muted-foreground/50 shrink-0" />
                      )}
                    </div>
                    {note.content && (
                      <p className="hidden @xs:block text-[10px] text-muted-foreground/70 line-clamp-1 mt-0.5">
                        {note.content}
                      </p>
                    )}
                  </div>
                  {note.tags.length > 0 && (
                    <span className="hidden @sm:inline text-[9px] text-muted-foreground/40 bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)] px-1.5 py-0.5 rounded shrink-0">
                      {note.tags[0]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardWidgetWrapper>
  );
}
