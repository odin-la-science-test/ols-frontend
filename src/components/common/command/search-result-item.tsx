'use client';

import { Command } from 'cmdk';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import type { SearchResult } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// SearchResultItem — affichage d'un résultat de recherche fédérée
// ═══════════════════════════════════════════════════════════════════════════

export interface SearchResultItemProps {
  result: SearchResult;
  onSelect: () => void;
}

export function SearchResultItem({ result, onSelect }: SearchResultItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      value={`${result.moduleId}-${result.id}-${result.title}`}
      keywords={[result.title, result.subtitle || '', ...(result.tags || [])]}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
        'text-sm text-foreground/90',
        'data-[selected=true]:bg-muted data-[selected=true]:text-foreground',
        'transition-colors duration-150'
      )}
    >
      <span className="text-muted-foreground">
        <DynamicIcon name={result.icon} className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">{result.title}</div>
        {result.subtitle && (
          <div className="truncate text-xs text-muted-foreground mt-0.5">{result.subtitle}</div>
        )}
      </div>
      {result.tags && result.tags.length > 0 && (
        <div className="hidden sm:flex items-center gap-1">
          {result.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-[10px] bg-muted/50 text-muted-foreground rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
    </Command.Item>
  );
}
