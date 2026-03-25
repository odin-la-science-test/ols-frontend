'use client';

import type { ReactNode } from 'react';

import { Command } from 'cmdk';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// CommandItem & CommandGroup — primitives réutilisables pour la command palette
// ═══════════════════════════════════════════════════════════════════════════

export interface CommandItemProps {
  icon?: ReactNode;
  children: ReactNode;
  shortcut?: string;
  onSelect: () => void;
  keywords?: string[];
}

export function CommandItem({ icon, children, shortcut, onSelect, keywords }: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      keywords={keywords}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
        'text-sm text-foreground/90',
        'data-[selected=true]:bg-muted data-[selected=true]:text-foreground',
        'transition-colors duration-150'
      )}
    >
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-muted-foreground bg-muted/50 rounded">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}

export interface CommandGroupProps {
  heading: string;
  children: ReactNode;
}

export function CommandGroup({ heading, children }: CommandGroupProps) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
    >
      {children}
    </Command.Group>
  );
}
