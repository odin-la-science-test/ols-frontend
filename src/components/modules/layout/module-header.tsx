'use client';

import { type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';
import {
  SlidersHorizontal,
  MoreVertical,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getModuleIcon } from '@/lib/module-icons';
import {
  IconButtonWithTooltip,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui';
import { useModuleLayout } from './module-layout';
import { useDensity } from '@/hooks';
import { useModuleToolbarStore } from '@/stores/module-toolbar-store';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE HEADER - Mobile-only action bar (lg:hidden)
//
// Reads module-toolbar-store to generically render module actions.
// Layout:
//   [← Back]  [Icon Title]  ...  [Toolbar btns] [⋮ overflow]
//
// The overflow ⋮ menu combines:
//   1. Custom mobileMenuItems (module-specific, e.g. "New Ticket")
//   2. Module actions from toolbar-store with mobile=true
//
// Toolbar buttons (e.g. filter toggle) appear as icons to the left of ⋮.
// ═══════════════════════════════════════════════════════════════════════════

export interface MobileMenuItem {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

interface ModuleHeaderProps {
  /** Module title — shown only on mobile (desktop uses breadcrumbs) */
  title: string;
  /** Module icon — shown only on mobile */
  icon?: LucideIcon;
  /** Mobile back navigation target */
  backTo?: string;
  /** Extra elements before sidebar toggle */
  leftActions?: ReactNode;
  className?: string;
  /** Extra items for the overflow menu (module-specific) */
  mobileMenuItems?: MobileMenuItem[];
  /** Show sidebar/filter controls (default: true) */
  showFilters?: boolean;
}

export function ModuleHeader({
  title,
  icon: Icon,
  backTo = '/atlas',
  leftActions,
  className,
  mobileMenuItems,
  showFilters = true,
}: ModuleHeaderProps) {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen } = useModuleLayout();
  const d = useDensity();

  // Read module actions from the store (generic, no prop-drilling)
  const toolbar = useModuleToolbarStore((s) => s.registration);

  // Filter actions for mobile overflow menu
  const mobileActions = toolbar?.actions.filter((a) => a.mobile) ?? [];
  const hasOverflowItems =
    (mobileMenuItems && mobileMenuItems.length > 0) ||
    mobileActions.length > 0;

  return (
    <div
      className={cn(
        'w-full shrink-0 border-b border-border/30 lg:hidden',
        className
      )}
    >
      <div className={cn(
        'flex items-center justify-between',
        d.density === 'compact' ? 'h-8 px-2' : d.density === 'comfortable' ? 'h-11 px-4' : 'h-9 px-3',
      )}>
        {/* ── Left: Back + Title ── */}
        <div className="flex items-center gap-1 min-w-0">
          <Link
            to={backTo}
            className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2 mr-2 min-w-0">
            {Icon && <Icon className="h-4 w-4 text-foreground shrink-0" strokeWidth={1.5} />}
            <span className="text-sm font-semibold truncate">{title}</span>
          </div>
          {leftActions}
        </div>

        {/* ── Right: Custom actions + Filter toggle + Overflow ── */}
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Filter / sidebar toggle */}
          {showFilters && (
            <IconButtonWithTooltip
              icon={<SlidersHorizontal className="h-4 w-4 text-muted-foreground" />}
              tooltip={t('activityBar.modulePanel')}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
          )}

          {/* Overflow ⋮ menu — Custom items + module actions */}
          {hasOverflowItems && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Custom module items (e.g. "New Ticket" on mobile) */}
                {mobileMenuItems && mobileMenuItems.length > 0 && (
                  <>
                    {mobileMenuItems.map((item, index) => {
                      const ItemIcon = item.icon;
                      return (
                        <DropdownMenuItem key={index} onClick={item.onClick}>
                          <ItemIcon className="h-4 w-4 mr-2" />
                          <span>{item.label}</span>
                        </DropdownMenuItem>
                      );
                    })}
                    {mobileActions.length > 0 && <DropdownMenuSeparator />}
                  </>
                )}

                {/* Generic module actions from toolbar store */}
                {mobileActions.map((action, index) => {
                  const ActionIcon = getModuleIcon(action.icon);
                  const isActive = action.isActive?.() ?? false;
                  const isDisabled = action.isDisabled?.() ?? false;

                  return (
                    <span key={action.id}>
                      {action.separator && index > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem onClick={action.action} disabled={isDisabled}>
                        <ActionIcon className={cn('h-4 w-4 mr-2', isActive ? 'text-primary' : '')} />
                        <span>{t(action.labelKey)}</span>
                        {isActive && (
                          <span className="ml-auto">
                            <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                          </span>
                        )}
                      </DropdownMenuItem>
                    </span>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
