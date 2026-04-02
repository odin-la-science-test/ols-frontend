'use client';

import { useState, type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Filter, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SlidePanel } from '../shared/slide-panel';
import { useModuleLayout } from './module-layout';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE SIDEBAR - Collapsible sidebar with accordion sections
// ═══════════════════════════════════════════════════════════════════════════

interface ModuleSidebarProps {
  children: ReactNode;
  className?: string;
  width?: number;
}

export function ModuleSidebar({ 
  children, 
  className,
  width = 320 
}: ModuleSidebarProps) {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen } = useModuleLayout();

  return (
    <>
      {/* Mobile: Slide panel from left */}
      <div className="lg:hidden">
        <SlidePanel
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          side="left"
          title={t('common.filters')}
          icon={Filter}
          showOverlay={true}
        >
          <div className="p-4 space-y-2">
            {children}
          </div>
        </SlidePanel>
      </div>

      {/* Desktop: Static sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={cn(
              'hidden lg:flex flex-col flex-shrink-0',
              'surface-high',
              'border-r border-border/50',
              'overflow-hidden',
              className
            )}
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {children}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Sidebar Section (Accordion) ───
interface SidebarSectionProps {
  title: string;
  icon?: LucideIcon;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function SidebarSection({
  title,
  defaultOpen = true,
  children,
  className,
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between',
          'px-3 py-2.5 rounded-lg',
          'text-sm font-medium text-muted-foreground',
          'hover:bg-muted/50 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        )}
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-2 pt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Attach section to sidebar
ModuleSidebar.Section = SidebarSection;
