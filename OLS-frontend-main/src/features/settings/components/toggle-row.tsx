import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ─── Toggle Row ───

export interface ToggleRowProps {
  icon: ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

export function ToggleRow({ icon, label, description, checked, onChange }: ToggleRowProps) {
  return (
    <button
      onClick={onChange}
      className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-all duration-150 text-left"
    >
      <div className={cn('shrink-0', checked ? 'text-foreground' : 'text-muted-foreground')}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {/* Toggle */}
      <div
        className={cn(
          'relative w-9 h-5 rounded-full shrink-0 transition-colors duration-200',
          checked
            ? 'bg-foreground/60'
            : 'bg-border'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-transform duration-200',
            checked ? 'translate-x-4 bg-background' : 'translate-x-0.5 bg-background border border-border'
          )}
        />
      </div>
    </button>
  );
}
