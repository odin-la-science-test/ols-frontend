'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  Download,
  MoreVertical,
  Check,
  GitCompareArrows,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
import { useViewStore } from '@/stores';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE HEADER - Mobile-only action bar (lg:hidden)
//
// Reads module-toolbar-store to generically render module actions.
// Layout:
//   [← Back]  [Icon Title]  ...  [Toolbar btns] [⋮ overflow]
//
// The overflow ⋮ menu combines:
//   1. Custom mobileMenuItems (module-specific, e.g. "New Ticket")
//   2. Module menu items from toolbar-store (view, compare, export)
//
// Toolbar buttons (e.g. filter toggle) appear as icons to the left of ⋮.
// When space is too tight, buttons collapse into the overflow menu.
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
  /** @deprecated No longer displayed, kept for API compat */
  backLabel?: string;
  /** Extra elements before sidebar toggle */
  leftActions?: React.ReactNode;
  /** Extra elements on the right (e.g. "New Ticket" button) */
  actions?: React.ReactNode;
  className?: string;
  /** Extra items for the overflow menu (module-specific) */
  mobileMenuItems?: MobileMenuItem[];
  /** Show sidebar/filter controls (default: true) */
  showFilters?: boolean;

  // ── Legacy props (kept for API compat, consumed by overflow menu) ──
  /** @deprecated Read from toolbar-store now */
  viewMode?: import('@/components/modules/types').ViewMode;
  /** @deprecated Read from toolbar-store now */
  onViewModeChange?: (mode: import('@/components/modules/types').ViewMode) => void;
  /** @deprecated Read from toolbar-store now */
  hasCardView?: boolean;
  /** @deprecated Read from toolbar-store now */
  onExport?: () => void;
  /** @deprecated Read from toolbar-store now */
  canExport?: boolean;
  /** @deprecated Read from toolbar-store now */
  isCompareMode?: boolean;
  /** @deprecated Read from toolbar-store now */
  onToggleCompareMode?: () => void;
  /** @deprecated Read from toolbar-store now */
  hasCompare?: boolean;
}

export function ModuleHeader({
  title,
  icon: Icon,
  backTo = '/atlas',
  leftActions,
  actions,
  className,
  mobileMenuItems,
  showFilters = true,
}: ModuleHeaderProps) {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen } = useModuleLayout();
  const d = useDensity();

  // Read module capabilities from the store (generic, no prop-drilling)
  const toolbar = useModuleToolbarStore((s) => s.registration);
  const viewMode = useViewStore((s) => s.viewMode);

  // Derive overflow menu items from toolbar-store + custom items
  const hasOverflowItems =
    (mobileMenuItems && mobileMenuItems.length > 0) ||
    toolbar?.hasCardView ||
    toolbar?.hasCompare ||
    toolbar?.hasExport;

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
          {/* Custom header actions (e.g. "+ New Ticket" button) */}
          {actions && (
            <div className="flex items-center gap-1">
              {actions}
            </div>
          )}

          {/* Filter / sidebar toggle */}
          {showFilters && (
            <IconButtonWithTooltip
              icon={<SlidersHorizontal className="h-4 w-4 text-muted-foreground" />}
              tooltip={t('activityBar.modulePanel')}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
          )}

          {/* Overflow ⋮ menu — Module menu items + custom items */}
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
                    {(toolbar?.hasCardView || toolbar?.hasCompare || toolbar?.hasExport) && (
                      <DropdownMenuSeparator />
                    )}
                  </>
                )}

                {/* View mode (from toolbar-store) */}
                {toolbar?.hasCardView && (
                  <>
                    <DropdownMenuItem onClick={() => toolbar.onToggleViewMode()}>
                      {viewMode === 'table'
                        ? <LayoutList className="h-4 w-4 mr-2" />
                        : <LayoutGrid className="h-4 w-4 mr-2" />
                      }
                      <span>{viewMode === 'table' ? t('common.viewTable') : t('common.viewCards')}</span>
                      <Check className={cn('ml-auto h-4 w-4', viewMode === 'table' ? 'opacity-0' : 'text-primary')} />
                    </DropdownMenuItem>
                  </>
                )}

                {/* Compare mode (from toolbar-store) */}
                {toolbar?.hasCompare && (
                  <>
                    {toolbar.hasCardView && <DropdownMenuSeparator />}
                    <DropdownMenuItem onClick={() => toolbar.onToggleCompareMode()}>
                      <GitCompareArrows className="h-4 w-4 mr-2" />
                      <span>
                        {toolbar.isCompareMode
                          ? t('modules.comparison.exitMode')
                          : t('modules.compare')
                        }
                      </span>
                      {toolbar.isCompareMode && <Check className="ml-auto h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                  </>
                )}

                {/* Export (from toolbar-store) */}
                {toolbar?.hasExport && (
                  <>
                    {(toolbar.hasCardView || toolbar.hasCompare) && <DropdownMenuSeparator />}
                    <DropdownMenuItem onClick={() => toolbar.onExport()} disabled={!toolbar.canExport}>
                      <Download className="h-4 w-4 mr-2" />
                      <span>{t('common.export')}</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
