import { Activity, Navigation, MousePointer, Database, Settings } from 'lucide-react';
import type { BottomPanelTab, ActivityLogEntry } from '@/stores/bottom-panel-store';

/** Built-in tabs that are always present */
export const BUILTIN_TABS: { id: BottomPanelTab; icon: typeof Activity; labelKey: string }[] = [
  { id: 'activity', icon: Activity, labelKey: 'bottomPanel.activity' },
];

export const ENTRY_TYPE_ICON: Record<ActivityLogEntry['type'], typeof Navigation> = {
  navigation: Navigation,
  action: MousePointer,
  data: Database,
  system: Settings,
};

export const ENTRY_TYPE_COLOR: Record<ActivityLogEntry['type'], string> = {
  navigation: 'text-blue-400',
  action: 'text-emerald-400',
  data: 'text-amber-400',
  system: 'text-muted-foreground',
};

export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
