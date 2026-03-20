import { useThemeStore, type Density } from '@/stores';

// ═══════════════════════════════════════════════════════════════════════════
// DENSITY HOOK - Returns Tailwind classes based on current density setting
// Usage: const d = useDensity();
//        <td className={d.tableCellPadding}>
// ═══════════════════════════════════════════════════════════════════════════

interface DensityClasses {
  /** Current density value */
  density: Density;

  // ─── Table ───
  /** Table header cells: compact=px-3 py-1.5 | normal=px-4 py-3 | comfortable=px-5 py-4 */
  tableHeaderPadding: string;
  /** Table body cells: compact=px-3 py-1.5 | normal=px-4 py-3 | comfortable=px-5 py-4 */
  tableCellPadding: string;
  /** Checkbox column: compact=w-10 px-2 py-1.5 | normal=w-12 px-3 py-3 | comfortable=w-14 px-3 py-4 */
  tableCheckboxPadding: string;

  // ─── Header ───
  /** Module header height: compact=h-9 | normal=h-16 | comfortable=h-20 */
  headerHeight: string;
  /** Header horizontal padding */
  headerPadding: string;
  /** Gap between header items */
  headerGap: string;
  /** Header icon size class: compact=h-4 w-4 | normal=h-5 w-5 | comfortable=h-5 w-5 */
  headerIconSize: string;
  /** Title text size: compact=text-sm | normal=text-lg | comfortable=text-xl */
  headerTitleSize: string;
  /** Action button size: compact=xs | normal=sm | comfortable=default */
  headerButtonSize: 'xs' | 'sm' | 'default';
  /** Action button icon size: compact=h-3.5 w-3.5 | normal=h-4 w-4 | comfortable=h-4 w-4 */
  headerButtonIconSize: string;

  // ─── Content area ───
  /** Main content padding: compact=p-2 md:p-3 | normal=p-4 md:p-6 | comfortable=p-5 md:p-8 */
  contentPadding: string;
  /** Vertical spacing between sections: compact=space-y-2 | normal=space-y-4 | comfortable=space-y-6 */
  contentGap: string;

  // ─── Cards ───
  /** Grid gap between cards: compact=gap-2 | normal=gap-4 | comfortable=gap-6 */
  cardGridGap: string;
  /** Card internal header padding: compact=px-3 py-2 | normal=px-4 py-3 | comfortable=px-5 py-4 */
  cardHeaderPadding: string;
  /** Card section padding: compact=px-3 py-2 | normal=px-4 py-3 | comfortable=px-5 py-4 */
  cardSectionPadding: string;

  // ─── Stats ───
  /** Stats bar padding & gap: compact=p-2 gap-2 md:gap-3 | normal=p-4 gap-4 md:gap-6 | comfortable=p-5 gap-5 md:gap-8 */
  statsBarPadding: string;
  statsBarGap: string;

  // ─── Detail Panel ───
  /** Detail panel padding: compact=p-3 | normal=p-4 | comfortable=p-5 */
  detailPadding: string;
  /** Detail section spacing: compact=space-y-2 | normal=space-y-3 | comfortable=space-y-4 */
  detailSectionGap: string;

  // ─── Generic ───
  /** Banner/alert padding: compact=px-3 py-2 | normal=px-4 py-3 | comfortable=px-5 py-4 */
  bannerPadding: string;
  /** Pagination padding: compact=px-1 py-2 | normal=px-2 py-3 | comfortable=px-3 py-4 */
  paginationPadding: string;
}

const DENSITY_CLASSES: Record<Density, DensityClasses> = {
  compact: {
    density: 'compact',
    // Table – VS Code-like tight rows
    tableHeaderPadding: 'px-2 py-1',
    tableCellPadding: 'px-2 py-1',
    tableCheckboxPadding: 'w-8 px-1.5 py-1',
    // Header – VS Code-like minimal
    headerHeight: 'h-9',
    headerPadding: 'px-2 md:px-3',
    headerGap: 'gap-2',
    headerIconSize: 'h-4 w-4',
    headerTitleSize: 'text-sm',
    headerButtonSize: 'xs' as const,
    headerButtonIconSize: 'h-3.5 w-3.5',
    // Content – very tight
    contentPadding: 'p-1.5 md:p-2',
    contentGap: 'space-y-1.5',
    // Cards – minimal gaps
    cardGridGap: 'gap-1.5',
    cardHeaderPadding: 'px-2 py-1.5',
    cardSectionPadding: 'px-2 py-1',
    // Stats – tight
    statsBarPadding: 'p-1.5',
    statsBarGap: 'gap-1.5 md:gap-2',
    // Detail – tight
    detailPadding: 'p-2',
    detailSectionGap: 'space-y-1.5',
    // Generic
    bannerPadding: 'px-2 py-1.5',
    paginationPadding: 'px-1 py-1.5',
  },
  normal: {
    density: 'normal',
    // Table
    tableHeaderPadding: 'px-4 py-3',
    tableCellPadding: 'px-4 py-3',
    tableCheckboxPadding: 'w-12 px-3 py-3',
    // Header
    headerHeight: 'h-16',
    headerPadding: 'px-4 md:px-6',
    headerGap: 'gap-4',
    headerIconSize: 'h-5 w-5',
    headerTitleSize: 'text-lg',
    headerButtonSize: 'sm' as const,
    headerButtonIconSize: 'h-4 w-4',
    // Content
    contentPadding: 'p-4 md:p-6',
    contentGap: 'space-y-4',
    // Cards
    cardGridGap: 'gap-4',
    cardHeaderPadding: 'px-4 py-3',
    cardSectionPadding: 'px-4 py-3',
    // Stats
    statsBarPadding: 'p-4',
    statsBarGap: 'gap-4 md:gap-6',
    // Detail
    detailPadding: 'p-4',
    detailSectionGap: 'space-y-3',
    // Generic
    bannerPadding: 'px-4 py-3',
    paginationPadding: 'px-2 py-3',
  },
  comfortable: {
    density: 'comfortable',
    // Table
    tableHeaderPadding: 'px-5 py-4',
    tableCellPadding: 'px-5 py-4',
    tableCheckboxPadding: 'w-14 px-3 py-4',
    // Header
    headerHeight: 'h-20',
    headerPadding: 'px-5 md:px-8',
    headerGap: 'gap-4',
    headerIconSize: 'h-5 w-5',
    headerTitleSize: 'text-xl',
    headerButtonSize: 'default' as const,
    headerButtonIconSize: 'h-4 w-4',
    // Content
    contentPadding: 'p-5 md:p-8',
    contentGap: 'space-y-6',
    // Cards
    cardGridGap: 'gap-6',
    cardHeaderPadding: 'px-5 py-4',
    cardSectionPadding: 'px-5 py-4',
    // Stats
    statsBarPadding: 'p-5',
    statsBarGap: 'gap-5 md:gap-8',
    // Detail
    detailPadding: 'p-5',
    detailSectionGap: 'space-y-4',
    // Generic
    bannerPadding: 'px-5 py-4',
    paginationPadding: 'px-3 py-4',
  },
};

export function useDensity(): DensityClasses {
  const density = useThemeStore((s) => s.density);
  return DENSITY_CLASSES[density];
}
