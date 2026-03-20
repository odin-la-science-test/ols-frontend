'use client';

import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/stores';

// ═══════════════════════════════════════════════════════════════════════════
// BREADCRUMBS - Pure navigation component
//
// Displays:  Home > Atlas > Bactériologie
// No toolbar logic — that lives in ModuleToolbar (separate component).
// ═══════════════════════════════════════════════════════════════════════════

interface BreadcrumbSegment {
  label: string;
  path: string;
}

/**
 * Maps route segments to i18n translation keys.
 * Each key maps to a translation path that resolves the segment's display label.
 */
const SEGMENT_LABELS: Record<string, string> = {
  atlas: 'atlas.title',
  lab: 'lab.title',
  bacteriology: 'bacteriology.title',
  mycology: 'mycology.title',
  quickshare: 'quickshare.title',
  notes: 'notes.title',
  contacts: 'contacts.title',
  notifications: 'notifications.title',
  support: 'support.title',
  admin: 'breadcrumbs.admin',
  profile: 'profile.title',
  settings: 'settingsPage.title',
};

/**
 * Build breadcrumb segments from the current pathname.
 * Skips the root `/` segment (represented by the Home icon).
 */
function buildBreadcrumbs(pathname: string, t: (key: string) => string): BreadcrumbSegment[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: BreadcrumbSegment[] = [];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const labelKey = SEGMENT_LABELS[segment];
    const label = labelKey ? t(labelKey) : segment.charAt(0).toUpperCase() + segment.slice(1);
    crumbs.push({ label, path: currentPath });
  }

  return crumbs;
}

interface BreadcrumbsProps {
  /** Override the current item's label (e.g., selected detail item name) */
  currentItemLabel?: string;
  /** Override the pathname (e.g., for split editor groups that don't match the URL) */
  pathOverride?: string;
  /** Force render even when workspace toggle is disabled */
  forceVisible?: boolean;
  className?: string;
}

export function Breadcrumbs({ currentItemLabel, pathOverride, forceVisible = false, className }: BreadcrumbsProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const showBreadcrumbs = useWorkspaceStore((s) => s.showBreadcrumbs);

  const crumbs = buildBreadcrumbs(pathOverride ?? location.pathname, t);

  // Don't render if disabled or on root page
  if ((!showBreadcrumbs && !forceVisible) || crumbs.length === 0) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center gap-1 flex-1 min-w-0',
        'text-xs text-muted-foreground',
        className
      )}
    >
      {/* Home icon */}
      <Link
        to="/"
        className="flex items-center hover:text-foreground transition-colors duration-200 shrink-0"
        aria-label={t('breadcrumbs.home')}
      >
        <Home className="w-3.5 h-3.5" strokeWidth={1.5} />
      </Link>

      {/* Segments */}
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1 && !currentItemLabel;
        const isBeforeLast = index === crumbs.length - 1 && !!currentItemLabel;

        return (
          <div key={crumb.path} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            {isLast ? (
              <span className="text-foreground font-medium truncate max-w-[200px]">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className={cn(
                  'hover:text-foreground transition-colors duration-200 truncate max-w-[200px]',
                  isBeforeLast && 'text-muted-foreground'
                )}
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}

      {/* Optional: Selected item name (e.g., "E. coli") */}
      {currentItemLabel && (
        <div className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {currentItemLabel}
          </span>
        </div>
      )}
    </motion.nav>
  );
}
