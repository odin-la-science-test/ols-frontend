'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHubModules, type HubModule } from '@/hooks';
import { useAuthStore, useThemeStore } from '@/stores';
import { getModuleIcon } from '@/lib/module-icons';
import { MUNIN_PRIMARY, HUGIN_PRIMARY } from '@/lib/accent-colors';
import type { ModuleType } from '@/api';

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM MEGA MENU - Dropdown listing all modules for a platform
//
// Appears when hovering the Atlas or Lab icon in the Activity Bar.
// Fetches modules from the API and shows them with icon + title + description.
// Locked modules are shown but greyed out.
// ═══════════════════════════════════════════════════════════════════════════

interface PlatformMegaMenuProps {
  /** The platform type */
  platform: 'atlas' | 'lab';
  /** The trigger element (the activity bar icon button) */
  children: ReactNode;
  /** Whether the trigger icon is currently active (route match) */
  isActive: boolean;
}

const PLATFORM_CONFIG = {
  atlas: {
    type: 'MUNIN_ATLAS' as ModuleType,
    titleKey: 'atlas.title',
    subtitleKey: 'atlas.subtitle',
    accentColor: MUNIN_PRIMARY,
    path: '/atlas',
    icon: 'book-open',
  },
  lab: {
    type: 'HUGIN_LAB' as ModuleType,
    titleKey: 'lab.title',
    subtitleKey: 'lab.subtitle',
    accentColor: HUGIN_PRIMARY,
    path: '/lab',
    icon: 'flask-conical',
  },
} as const;

export function PlatformMegaMenu({ platform, children }: PlatformMegaMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const config = PLATFORM_CONFIG[platform];
  const density = useThemeStore((s) => s.density);
  const isGuest = useAuthStore((s) => s.user?.role === 'GUEST');

  const [open, setOpen] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch modules only when menu is shown (or about to be shown)
  const { data: modules, isLoading } = useHubModules(config.type);

  // ─── Hover logic with delay ───
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    hoverTimeoutRef.current = setTimeout(() => setOpen(true), 200);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 250);
  };

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleNavigateModule = (routePath: string) => {
    navigate(routePath);
    setOpen(false);
  };

  const handleNavigatePlatform = () => {
    navigate(config.path);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ─── Original activity bar icon (trigger) ─── */}
      {children}

      {/* ─── Mega menu panel ─── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -4, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute left-full top-0 z-50 ml-1.5',
              'min-w-[280px] max-w-[320px]',
              'rounded-xl border border-[color-mix(in_srgb,var(--color-border)_50%,transparent)]',
              'bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)] backdrop-blur-xl shadow-xl',
              'overflow-hidden'
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* ─── Header ─── */}
            <button
              onClick={handleNavigatePlatform}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5',
                'border-b border-[color-mix(in_srgb,var(--color-border)_30%,transparent)] transition-colors',
                'hover:bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)] cursor-pointer text-left'
              )}
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                style={{ backgroundColor: `${config.accentColor}20` }}
              >
                <PlatformIcon name={config.icon} color={config.accentColor} size={density === 'compact' ? 'sm' : 'md'} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate" style={{ color: config.accentColor }}>
                  {t(config.titleKey)}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {t(config.subtitleKey)}
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
            </button>

            {/* ─── Module list ─── */}
            <div className="py-1 max-h-[360px] overflow-y-auto scrollbar-thin">
              {isLoading && (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-xs">{t('common.loading')}</span>
                </div>
              )}

              {!isLoading && (!modules || modules.length === 0) && (
                <div className="text-center py-6 text-muted-foreground/60 text-xs">
                  {t('megaMenu.noModules')}
                </div>
              )}

              {!isLoading && modules && modules.map((mod, index) => (
                <ModuleMenuItem
                  key={mod.moduleKey}
                  module={mod}
                  isLocked={mod.locked || !!isGuest}
                  isCurrentRoute={location.pathname === mod.routePath || location.pathname.startsWith(mod.routePath + '/')}
                  accentColor={config.accentColor}
                  delay={index * 30}
                  onNavigate={handleNavigateModule}
                />
              ))}
            </div>

            {/* ─── Footer ─── */}
            {modules && modules.length > 0 && (
              <div className="border-t border-[color-mix(in_srgb,var(--color-border)_30%,transparent)] px-3 py-1.5">
                <span className="text-[10px] text-muted-foreground/50">
                  {t('megaMenu.moduleCount', { count: modules.length })}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Module menu item ───

interface ModuleMenuItemProps {
  module: HubModule;
  isLocked: boolean;
  isCurrentRoute: boolean;
  accentColor: string;
  delay: number;
  onNavigate: (path: string) => void;
}

function ModuleMenuItem({ module, isLocked, isCurrentRoute, accentColor, delay, onNavigate }: ModuleMenuItemProps) {
  const IconComp = getModuleIcon(module.icon);

  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: delay / 1000 }}
      onClick={() => !isLocked && onNavigate(module.routePath)}
      disabled={isLocked}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 text-left',
        'transition-colors duration-100 group/item',
        isLocked
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:bg-[color-mix(in_srgb,var(--color-muted)_40%,transparent)] cursor-pointer',
        isCurrentRoute && !isLocked && 'bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)]'
      )}
    >
      {/* Active indicator */}
      <div
        className={cn(
          'w-[2px] h-6 rounded-full shrink-0 transition-colors',
          isCurrentRoute ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-40'
        )}
        style={{ backgroundColor: accentColor }}
      />

      {/* Module icon */}
      <div
        className={cn(
          'flex items-center justify-center w-7 h-7 rounded-md shrink-0 transition-colors',
          isCurrentRoute ? 'bg-[color-mix(in_srgb,var(--color-muted)_60%,transparent)]' : 'bg-[color-mix(in_srgb,var(--color-muted)_30%,transparent)] group-hover/item:bg-[color-mix(in_srgb,var(--color-muted)_50%,transparent)]'
        )}
      >
        <IconComp className="h-3.5 w-3.5 text-[color-mix(in_srgb,var(--color-foreground)_70%,transparent)]" />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className={cn(
          'text-xs font-medium truncate',
          isCurrentRoute ? 'text-foreground' : 'text-[color-mix(in_srgb,var(--color-foreground)_80%,transparent)]'
        )}>
          {module.title}
        </div>
        {module.description && (
          <div className="text-[10px] text-muted-foreground/60 truncate leading-tight">
            {module.description}
          </div>
        )}
      </div>

      {/* Lock icon */}
      {isLocked && (
        <Lock className="h-3 w-3 text-muted-foreground/40 shrink-0" />
      )}
    </motion.button>
  );
}

// ─── Platform icon helper ───

function PlatformIcon({ name, color, size = 'md' }: { name: string; color: string; size?: 'sm' | 'md' }) {
  const IconComp = getModuleIcon(name);
  return (
    <IconComp
      className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'}
      style={{ color }}
    />
  );
}
