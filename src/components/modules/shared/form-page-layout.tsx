'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { ModuleLayout } from '@/components/modules/layout';
import { ModuleHeader, type MobileMenuItem } from '@/components/modules/layout/module-header';
import { useDensity } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// FORM PAGE LAYOUT - Reusable layout for form/settings-type pages
// Uses ModuleLayout + ModuleHeader (without filters/sidebar/table)
// with a centered scrollable content area (max-w-2xl)
// 
// Perfect for: Profile, Settings, FAQ, About, or any form-based page
// ═══════════════════════════════════════════════════════════════════════════

// ─── Section Card ───
// Animated card with optional header (title + description)

interface FormSectionProps {
  /** HTML id for anchor links / scroll-to */
  id?: string;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  /** Delay multiplier for stagger animation (0, 1, 2...) */
  delay?: number;
  /** Right-side header action (e.g., button) */
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  id,
  title,
  description,
  icon: Icon,
  delay = 0,
  headerAction,
  children,
  className,
}: FormSectionProps) {
  const d = useDensity();
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.05 }}
      className={cn(
        'rounded-xl border border-border/30 bg-card/50 scroll-mt-16',
        className
      )}
    >
      {title && (
        <div className={cn(
          'border-b border-border/30 flex items-center justify-between',
          d.density === 'compact' ? 'px-4 py-2.5' : d.density === 'comfortable' ? 'px-7 py-5' : 'px-6 py-4'
        )}>
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
              {title}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          {headerAction}
        </div>
      )}
      <div className={cn(d.density === 'compact' ? 'p-4' : d.density === 'comfortable' ? 'p-7' : 'p-6')}>{children}</div>
    </motion.div>
  );
}

// ─── Form Page Layout ───

interface FormPageLayoutProps {
  /** Module accent color (HSL). When omitted, the theme's native --color-primary is used. */
  accentColor?: string;
  /** Page title */
  title: string;
  /** Icon displayed next to the title */
  icon: LucideIcon;
  /** Back navigation path (default: '/') */
  backTo?: string;
  /** Header action buttons (desktop) */
  actions?: React.ReactNode;
  /** Extra items in the mobile dropdown menu */
  mobileMenuItems?: MobileMenuItem[];
  /** Page content (use FormSection components) */
  children: React.ReactNode;
  /** Max width class for content area (default: 'max-w-2xl') */
  maxWidth?: string;
  className?: string;
}

export function FormPageLayout({
  accentColor,
  title,
  icon,
  backTo = '/',
  actions,
  mobileMenuItems,
  children,
  maxWidth = 'max-w-2xl',
  className,
}: FormPageLayoutProps) {
  const d = useDensity();
  return (
    <ModuleLayout {...(accentColor ? { accentColor } : {})}>
      <ModuleHeader
        title={title}
        icon={icon}
        backTo={backTo}
        showFilters={false}
        actions={actions}
        mobileMenuItems={mobileMenuItems}
      />
      <div className={cn('flex-1 overflow-y-auto', className)}>
        <div className={cn(
          'mx-auto pb-20 lg:pb-8',
          maxWidth,
          d.density === 'compact' ? 'p-3 md:p-5 space-y-3' : d.density === 'comfortable' ? 'p-6 md:p-10 space-y-8' : 'p-4 md:p-8 space-y-6'
        )}>
          {children}
        </div>
      </div>
    </ModuleLayout>
  );
}
