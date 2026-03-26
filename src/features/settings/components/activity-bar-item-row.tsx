import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIconComponent } from '@/lib/workspace-utils.tsx';
import type { ActivityBarItemId } from '@/stores';

// ─── Activity Bar Item Row ───

const ACTIVITY_BAR_LABEL_KEYS: Record<string, string> = {
  explorer: 'activityBar.explorer',
  notes: 'notes.title',
  notifications: 'notifications.title',
  settings: 'settings.title',
};

export interface ActivityBarItemRowProps {
  id: ActivityBarItemId;
  icon: string;
  visible: boolean;
  onToggle: () => void;
}

export function ActivityBarItemRow({ id, icon, visible, onToggle }: ActivityBarItemRowProps) {
  const { t } = useTranslation();
  const label = t(ACTIVITY_BAR_LABEL_KEYS[id] || id);

  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left',
        visible
          ? 'border-border/40 bg-card hover:border-border/60'
          : 'border-border/20 bg-card/50 opacity-60 hover:opacity-80'
      )}
    >
      <span className={cn('shrink-0', visible ? 'text-foreground' : 'text-muted-foreground')}>
        {getIconComponent(icon, 'h-4 w-4')}
      </span>
      <span className="flex-1 text-sm font-medium truncate">{label}</span>
      <span className={cn('shrink-0', visible ? 'text-foreground/60' : 'text-muted-foreground')}>
        {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </span>
    </button>
  );
}
