import { useEffect, useMemo, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// USE PAGINATION — Client-side pagination hook for collection layouts
// ═══════════════════════════════════════════════════════════════════════════

const PAGE_SIZE = 50;

interface UsePaginationOptions<T> {
  items: T[];
  initialPage?: number;
  /** Dependencies that should reset the page to 1 when changed */
  resetDeps?: unknown[];
}

interface UsePaginationResult<T> {
  paginatedItems: T[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  pageSize: number;
  shouldShowPagination: boolean;
}

export function usePagination<T>({
  items,
  initialPage = 1,
  resetDeps = [],
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Reset to page 1 when filters/search/sort change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setCurrentPage(1); }, resetDeps);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const shouldShowPagination = items.length > PAGE_SIZE;

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, currentPage]);

  return {
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    shouldShowPagination,
  };
}
