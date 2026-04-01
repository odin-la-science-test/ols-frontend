import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ThemePreset } from '@/lib/theme-presets';

// ─── Preset Card ───

export interface PresetCardProps {
  preset: ThemePreset;
  active: boolean;
  onClick: () => void;
}

export function PresetCard({ preset, active, onClick }: PresetCardProps) {
  const { t } = useTranslation();
  const { bg, surface, accent, text } = preset.preview;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col rounded-lg border overflow-hidden transition-all duration-150 group',
        active
          ? 'system-border ring-1 system-ring'
          : 'border-border/30 hover:border-border/50'
      )}
    >
      {/* Color preview mini-window */}
      <div
        className="w-full h-16 p-2 flex flex-col gap-1"
        style={{ backgroundColor: bg }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
            <div className="w-1.5 h-1.5 rounded-full opacity-40" style={{ backgroundColor: text }} />
            <div className="w-1.5 h-1.5 rounded-full opacity-40" style={{ backgroundColor: text }} />
          </div>
        </div>
        {/* Fake content */}
        <div className="flex gap-1 flex-1">
          {/* Sidebar */}
          <div className="w-4 rounded-sm flex flex-col gap-0.5 p-0.5" style={{ backgroundColor: surface }}>
            <div className="w-full h-0.5 rounded-full opacity-40" style={{ backgroundColor: text }} />
            <div className="w-full h-0.5 rounded-full opacity-25" style={{ backgroundColor: text }} />
            <div className="w-full h-0.5 rounded-full opacity-25" style={{ backgroundColor: text }} />
          </div>
          {/* Main */}
          <div className="flex-1 rounded-sm p-1" style={{ backgroundColor: surface }}>
            <div className="w-3/4 h-0.5 rounded-full mb-0.5" style={{ backgroundColor: accent }} />
            <div className="w-full h-0.5 rounded-full opacity-20" style={{ backgroundColor: text }} />
            <div className="w-2/3 h-0.5 rounded-full opacity-15 mt-0.5" style={{ backgroundColor: text }} />
          </div>
        </div>
      </div>

      {/* Label */}
      <div className={cn(
        'px-2 py-1.5 flex items-center justify-between',
        active ? 'bg-card' : 'bg-card'
      )}>
        <span className="text-[11px] font-medium truncate">{t(preset.labelKey)}</span>
        {active && <Check className={'w-3 h-3 shrink-0 system-check'} />}
      </div>
    </button>
  );
}
