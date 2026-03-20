import { useEffect } from 'react';
import { useStatusBarStore, type StatusBarItem } from '@/stores/status-bar-store';

// ═══════════════════════════════════════════════════════════════════════════
// USE STATUS BAR ITEMS - Hook for modules to register contextual items
//
// Usage:
//   useStatusBarItems('bacteriology', [
//     { id: 'bacteriology:count', position: 'left', text: '34 bacteria' },
//     { id: 'bacteriology:filtered', position: 'left', text: '12 filtered' },
//   ]);
//
// Items are automatically cleaned up when the component unmounts.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Register status bar items for a module. Items are set on mount/update
 * and automatically removed (by prefix) on unmount.
 *
 * @param prefix - Module prefix used for cleanup (e.g. 'bacteriology')
 * @param items - Array of status bar items to display
 */
export function useStatusBarItems(prefix: string, items: StatusBarItem[]) {
  const setItems = useStatusBarStore((s) => s.setItems);
  const removeByPrefix = useStatusBarStore((s) => s.removeByPrefix);

  useEffect(() => {
    if (items.length > 0) {
      setItems(items);
    }
    // Cleanup: remove all items for this module when unmounting
    return () => {
      removeByPrefix(`${prefix}:`);
    };
    // We stringify items to avoid infinite loops when the array reference changes
    // but the content is the same (common with useMemo in parent components).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefix, JSON.stringify(items), setItems, removeByPrefix]);
}
