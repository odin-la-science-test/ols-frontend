import { usePanelRegistryStore } from '@/stores/panel-registry-store';
import { useThemeStore } from '@/stores';

/** Resout la cle de traduction d'un item depuis le panel registry (ou fallback) */
export function getItemLabelKey(itemId: string): string {
  const panel = usePanelRegistryStore.getState().panels[itemId];
  if (panel?.label) return panel.label;
  // Fallback pour les items non-panel (settings, explorer)
  if (itemId === 'explorer') return 'activityBar.explorer';
  if (itemId === 'settings') return 'settings.title';
  return itemId;
}

// ─── Density-aware sizing for activity bar ──────────────────────────────

export function useActivityBarDensity() {
  const density = useThemeStore((s) => s.density);
  if (density === 'compact') {
    return { btnSize: 'w-7 h-7', iconSize: 'h-3.5 w-3.5', avatarSize: 'h-5 w-5' };
  }
  // normal & comfortable share the same activity bar sizing
  return { btnSize: 'w-10 h-10', iconSize: 'h-[18px] w-[18px]', avatarSize: 'h-6 w-6' };
}
