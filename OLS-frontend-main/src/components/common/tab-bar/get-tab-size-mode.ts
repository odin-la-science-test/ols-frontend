import type { TabSizeMode } from './types';

export function getTabSizeMode(count: number): TabSizeMode {
  if (count <= 6) return 'full';
  if (count <= 10) return 'shrunk';
  if (count <= 15) return 'mini';
  return 'icon-only';
}
