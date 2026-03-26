'use client';

import { type ReactNode } from 'react';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// MODULE CONTENT - Main content area with optional detail panel
// ═══════════════════════════════════════════════════════════════════════════

interface ModuleContentProps {
  children: ReactNode;
  className?: string;
}

export function ModuleContent({ children, className }: ModuleContentProps) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={cn(
        'flex-1 flex flex-col min-w-0',
        'overflow-hidden',
        className
      )}
    >
      {children}
    </motion.main>
  );
}

// ─── Primary Area (Left/Main) ───
interface ContentPrimaryProps {
  children: ReactNode;
  className?: string;
}

export function ContentPrimary({ children, className }: ContentPrimaryProps) {
  return (
    <div className={cn('flex-1 overflow-y-auto p-4 md:p-6', className)}>
      {children}
    </div>
  );
}

// ─── Detail Area (Right Panel) ───
interface ContentDetailProps {
  children: ReactNode;
  isOpen?: boolean;
  width?: number;
  className?: string;
}

export function ContentDetail({ 
  children, 
  isOpen = false,
  width = 400,
  className 
}: ContentDetailProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex-shrink-0 h-full',
        'glass-subtle',
        'border-l border-border/50',
        'overflow-hidden',
        className
      )}
    >
      <div className="h-full overflow-y-auto p-4">
        {children}
      </div>
    </motion.div>
  );
}

// Attach subcomponents
ModuleContent.Primary = ContentPrimary;
ModuleContent.Detail = ContentDetail;
