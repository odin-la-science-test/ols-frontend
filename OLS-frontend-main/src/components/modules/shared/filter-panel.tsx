'use client';

import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import type { FilterConfig, ActiveFilter, FilterOption } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// FILTER PANEL - Dynamic filter controls
// ═══════════════════════════════════════════════════════════════════════════

interface FilterPanelProps {
  filters: FilterConfig[];
  activeFilters: ActiveFilter[];
  onChange: (filters: ActiveFilter[]) => void;
  className?: string;
}

export function FilterPanel({
  filters,
  activeFilters,
  onChange,
  className,
}: FilterPanelProps) {
  const { t } = useTranslation();

  const getActiveValue = (key: string) => {
    return activeFilters.find((f) => f.key === key)?.value;
  };

  const setFilter = (key: string, value: string | boolean | null) => {
    if (value === null || value === '' || value === undefined) {
      // Remove filter
      onChange(activeFilters.filter((f) => f.key !== key));
    } else {
      // Update or add filter
      const exists = activeFilters.find((f) => f.key === key);
      if (exists) {
        onChange(activeFilters.map((f) => (f.key === key ? { ...f, value } : f)));
      } else {
        onChange([...activeFilters, { key, value }]);
      }
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div data-tour="filter-panel" className={cn('space-y-3', className)}>
      {filters.map((filter) => (
        <FilterControl
          key={filter.key}
          filter={filter}
          value={getActiveValue(filter.key)}
          onChange={(value) => setFilter(filter.key, value)}
        />
      ))}
      
      {activeFilters.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3 mr-2" />
          {t('modules.clearFilters')}
        </Button>
      )}
    </div>
  );
}

// ─── Single Filter Control ───
interface FilterControlProps {
  filter: FilterConfig;
  value: string | string[] | boolean | [number, number] | undefined;
  onChange: (value: string | boolean | null) => void;
}

function FilterControl({ filter, value, onChange }: FilterControlProps) {
  const { t } = useTranslation();
  const Icon = filter.icon;

  if (filter.type === 'select' && filter.options) {
    return (
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {Icon && <Icon className="h-3 w-3" />}
          {filter.label}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {filter.options.map((option) => (
            <FilterChip
              key={option.value}
              option={option}
              selected={value === option.value}
              onClick={() => onChange(value === option.value ? null : option.value)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (filter.type === 'favorite') {
    return (
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {Icon && <Icon className="h-3 w-3" />}
          {filter.label}
        </label>
        <FilterChip
          option={{ value: 'true', label: t('common.favoritesOnly') }}
          selected={value === true}
          onClick={() => onChange(value === true ? null : true)}
        />
      </div>
    );
  }

  if (filter.type === 'boolean') {
    const yesLabel = t('common.yes');
    const noLabel = t('common.no');

    return (
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {Icon && <Icon className="h-3 w-3" />}
          {filter.label}
        </label>
        <div className="flex gap-1.5">
          <FilterChip
            option={{ value: 'true', label: yesLabel }}
            selected={value === true}
            onClick={() => onChange(value === true ? null : true)}
          />
          <FilterChip
            option={{ value: 'false', label: noLabel }}
            selected={value === false}
            onClick={() => onChange(value === false ? null : false)}
          />
        </div>
      </div>
    );
  }

  return null;
}

// ─── Filter Chip ───
interface FilterChipProps {
  option: FilterOption;
  selected: boolean;
  onClick: () => void;
}

function FilterChip({ option, selected, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'chip-base gap-1.5 px-2.5 py-1 text-xs',
        selected ? 'chip-active' : 'chip-inactive'
      )}
    >
      <span>{option.label}</span>
      {option.count !== undefined && (
        <span className="text-[10px] opacity-70">({option.count})</span>
      )}
    </button>
  );
}
