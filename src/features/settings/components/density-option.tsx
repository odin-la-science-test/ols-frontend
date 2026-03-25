import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Density } from '@/stores/theme-store';

// ─── Density Option ───

const DENSITY_ICONS: Record<Density, ReactNode> = {
  compact: (
    <div className="flex flex-col gap-0.5">
      <div className="w-6 h-[3px] rounded-full bg-current" />
      <div className="w-4 h-[3px] rounded-full bg-current opacity-60" />
      <div className="w-5 h-[3px] rounded-full bg-current opacity-40" />
    </div>
  ),
  normal: (
    <div className="flex flex-col gap-1">
      <div className="w-6 h-[3px] rounded-full bg-current" />
      <div className="w-4 h-[3px] rounded-full bg-current opacity-60" />
      <div className="w-5 h-[3px] rounded-full bg-current opacity-40" />
    </div>
  ),
  comfortable: (
    <div className="flex flex-col gap-1.5">
      <div className="w-6 h-[3px] rounded-full bg-current" />
      <div className="w-4 h-[3px] rounded-full bg-current opacity-60" />
      <div className="w-5 h-[3px] rounded-full bg-current opacity-40" />
    </div>
  ),
};

export interface DensityOptionProps {
  density: Density;
  active: boolean;
  onClick: () => void;
}

export function DensityOption({ density, active, onClick }: DensityOptionProps) {
  const { t } = useTranslation();
  const labels: Record<Density, string> = {
    compact: t('settingsPage.densityCompact'),
    normal: t('settingsPage.densityNormal'),
    comfortable: t('settingsPage.densityComfortable'),
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-150',
        active
          ? 'bg-muted/40 text-foreground'
          : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
      )}
    >
      {DENSITY_ICONS[density]}
      <span className="text-xs font-medium">{labels[density]}</span>
      {active && <Check className={'w-3 h-3 text-[var(--module-accent)]'} />}
    </button>
  );
}
