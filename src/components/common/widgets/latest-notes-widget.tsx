import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { StickyNote, Pin, ArrowRight } from 'lucide-react';
import { DashboardWidgetWrapper } from './widget-wrapper';
import { useMyNotes } from '@/features/notes';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// LATEST NOTES WIDGET - Shows the most recent notes
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <StickyNote className="w-3.5 h-3.5" strokeWidth={1.5} />
            {t('dashboard.widgets.latestNotes')}
          </h3>
          <button
            onClick={() => navigate('/lab/notes')}
            className="text-[10px] text-muted-foreground/60 hover:text-foreground flex items-center gap-0.5 transition-colors"
          >
            {t('dashboard.viewAll')}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : latestNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/60">
            <StickyNote className="w-6 h-6 mb-2 opacity-40" />
            <p className="text-xs">{t('dashboard.noNotes')}</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {latestNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => navigate('/lab/notes')}
                className={cn(
                  'w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left',
                  'hover:bg-muted/30 transition-all duration-150 group',
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
                    <p className="text-[10px] text-muted-foreground/70 line-clamp-1 mt-0.5">
                      {note.content}
                    </p>
                  )}
                </div>
                {note.tags.length > 0 && (
                  <span className="text-[9px] text-muted-foreground/40 bg-muted/30 px-1.5 py-0.5 rounded shrink-0">
                    {note.tags[0]}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardWidgetWrapper>
  );
}
