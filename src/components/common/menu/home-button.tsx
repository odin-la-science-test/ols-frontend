'use client';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui';
import { Logo } from '@/components/common/logo';

interface HomeButtonProps {
  isCompact: boolean;
  onClose: () => void;
}

export function HomeButton({ isCompact, onClose }: HomeButtonProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          onClick={() => { navigate('/'); onClose(); }}
          className={cn(
            'flex items-center justify-center rounded-sm transition-colors',
            'hover:bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)]',
            isCompact ? 'h-5 w-5' : 'h-6 w-6'
          )}
        >
          <Logo size={isCompact ? 14 : 16} animate={false} className="drop-shadow-none" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{t('common.home')}</TooltipContent>
    </Tooltip>
  );
}
