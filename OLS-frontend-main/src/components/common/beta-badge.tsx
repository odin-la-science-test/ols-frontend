'use client';

import { useTranslation } from 'react-i18next';
import { IS_BETA } from '@/lib/app-version';

interface BetaBadgeProps {
  className?: string;
}

export function BetaBadge({ className }: BetaBadgeProps) {
  const { t } = useTranslation();

  if (!IS_BETA) return null;

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase leading-none tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/20 ${className ?? ''}`}
    >
      {t('beta.badge')}
    </span>
  );
}
