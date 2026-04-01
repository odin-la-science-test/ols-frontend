'use client';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from './logo';
import { BetaBadge } from './beta-badge';
import { UserMenu } from './user-menu';
import { ResumeWorkspaceButton } from './resume-workspace-button';
import { useWorkspaceStore } from '@/stores';

// ═══════════════════════════════════════════════════════════════════════════
// APP TOP BAR - Shared compact header used on Home, Atlas, Lab pages
//
// Mobile : Logo+Name only (UserMenu + ResumeWorkspace are in bottom bar)
// Desktop: [Logo+Name → /] | [ResumeWorkspace centered] | [UserMenu right]
//
// Hidden on desktop in classic mode (sidebar already provides logo + nav).
// Still visible on mobile in both modes (no sidebar on mobile).
// ═══════════════════════════════════════════════════════════════════════════

interface AppTopBarProps {
  /** Extra class on the outer wrapper (e.g. for z-index override) */
  className?: string;
  /** Max width constraint — defaults to none (full width) */
  maxWidth?: string;
}

export function AppTopBar({ className, maxWidth = '' }: AppTopBarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isClassic = useWorkspaceStore((s) => s.layoutMode === 'classic');

  return (
    <div
      className={`relative z-20 flex sm:grid sm:grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:px-6 py-3 ${maxWidth} mx-auto w-full ${isClassic ? 'lg:hidden' : ''} ${className ?? ''}`}
    >
      {/* Left: Logo + App name — clickable, goes home */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2.5 shrink-0 group"
        aria-label={t('common.home')}
      >
        <Logo size={28} animate={false} />
        <span className="text-sm font-semibold brand-title tracking-tight group-hover:text-foreground/80 transition-colors">
          {t('common.appName')}
        </span>
        <BetaBadge />
      </button>

      {/* Center: Resume workspace — desktop only */}
      <div className="hidden sm:flex justify-center px-2">
        <ResumeWorkspaceButton />
      </div>

      {/* Right: User menu — desktop only (mobile has bottom bar) */}
      <div className="hidden sm:flex justify-end">
        <UserMenu />
      </div>
    </div>
  );
}
