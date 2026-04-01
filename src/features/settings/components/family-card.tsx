import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ThemeFamily } from '@/lib/theme-presets';

interface FamilyCardProps {
  family: ThemeFamily;
  active: boolean;
  onClick: () => void;
}

export function FamilyCard({ family, active, onClick }: FamilyCardProps) {
  const { t } = useTranslation();
  const [color1, color2] = family.gradientPreview;

  // Derive mock colors from the gradient preview
  const bg = color1;
  const surface = color2;
  const accent = color1;
  // For text simulation, use white-ish for dark previews, dark for light
  const isLight = parseInt(color1.slice(1, 3), 16) > 128;
  const text = isLight ? '#333333' : '#ffffff';

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col rounded-xl overflow-hidden transition-all duration-200 group',
        active
          ? 'ring-2 ring-primary shadow-md scale-[1.02]'
          : 'ring-1 ring-border/30 hover:ring-border/60 hover:shadow-sm',
      )}
    >
      {/* Mini IDE mockup */}
      <div
        className="w-full h-20 p-1.5 flex flex-col gap-0.5"
        style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
      >
        {/* Title bar dots */}
        <div className="flex items-center gap-0.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent, opacity: 0.8 }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: text, opacity: 0.3 }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: text, opacity: 0.3 }} />
        </div>
        {/* Content area */}
        <div className="flex gap-1 flex-1 min-h-0">
          {/* Mini sidebar */}
          <div
            className="w-5 rounded-sm flex flex-col gap-0.5 p-0.5"
            style={{ backgroundColor: `${bg}80` }}
          >
            <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: text, opacity: 0.35 }} />
            <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: text, opacity: 0.2 }} />
            <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: text, opacity: 0.2 }} />
          </div>
          {/* Main content */}
          <div
            className="flex-1 rounded-sm p-1 flex flex-col gap-0.5"
            style={{ backgroundColor: `${surface}40` }}
          >
            <div className="w-3/4 h-0.5 rounded-full" style={{ backgroundColor: accent, opacity: 0.7 }} />
            <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: text, opacity: 0.15 }} />
            <div className="w-2/3 h-0.5 rounded-full" style={{ backgroundColor: text, opacity: 0.12 }} />
            <div className="w-5/6 h-0.5 rounded-full mt-auto" style={{ backgroundColor: text, opacity: 0.1 }} />
          </div>
        </div>

        {/* Active check */}
        {active && (
          <div className="absolute top-1.5 right-1.5 w-4.5 h-4.5 rounded-full bg-white/90 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-primary" />
          </div>
        )}
      </div>

      {/* Label */}
      <div className="px-2.5 py-1.5 bg-card">
        <span className="text-[11px] font-medium">{t(family.labelKey)}</span>
      </div>
    </button>
  );
}
