import { useQuery } from '@tanstack/react-query';
import { registry } from '@/lib/module-registry';
import type { ModuleSearchResult } from '@/lib/module-registry';

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL SEARCH HOOK - Federated search across all modules via registry
//
// Each module declares an optional `search` provider in its ModuleDefinition.
// This hook iterates all registered search providers and merges results.
// No module is referenced by name — adding a search provider to a new module
// automatically includes it in global search.
// ═══════════════════════════════════════════════════════════════════════════

/** A search result enriched with module metadata */
export interface SearchResult {
  id: string | number;
  moduleId: string;
  title: string;
  subtitle?: string;
  icon: string;
  path: string;
  tags?: string[];
  typeLabel: string;
}

/** Minimum query length before searching */
const MIN_QUERY_LENGTH = 2;

/** Max results per module */
const MAX_PER_MODULE = 5;

/** Container for grouped search results */
export interface GlobalSearchResults {
  /** Results grouped by module id */
  groups: Array<{
    moduleId: string;
    typeLabel: string;
    icon: string;
    results: SearchResult[];
  }>;
  total: number;
}

const EMPTY_RESULTS: GlobalSearchResults = {
  groups: [],
  total: 0,
};

/**
 * Search a single module safely — returns empty array on error
 */
async function searchModule(
  searchFn: () => Promise<ModuleSearchResult[]>,
  max: number,
): Promise<ModuleSearchResult[]> {
  try {
    const results = await searchFn();
    return results.slice(0, max);
  } catch {
    return [];
  }
}

/**
 * Hook: federated search across all modules via registry
 * - mode 'entity' → all modules with search providers (full-text via provider.search)
 * - mode 'tag'    → only modules with searchByTag (cheap prefix match on tags)
 * Only fires when query length >= MIN_QUERY_LENGTH
 */
export function useGlobalSearch(query: string, mode: SearchMode = 'entity') {
  const trimmed = query.trim();
  const enabled = trimmed.length >= MIN_QUERY_LENGTH;

  return useQuery<GlobalSearchResults>({
    queryKey: ['global-search', mode, trimmed],
    queryFn: async (): Promise<GlobalSearchResults> => {
      const providers = registry.getSearchProviders();

      // In tag mode, only keep modules that provide searchByTag
      const filtered = mode === 'tag'
        ? providers.filter((p) => !!p.provider.searchByTag)
        : providers;

      if (filtered.length === 0) return EMPTY_RESULTS;

      // Search all modules in parallel
      const searchPromises = filtered.map(async ({ module, provider }) => {
        const searchFn = mode === 'tag' && provider.searchByTag
          ? () => provider.searchByTag!(trimmed)
          : () => provider.search(trimmed);

        const results = await searchModule(searchFn, MAX_PER_MODULE);

        return {
          moduleId: module.id,
          typeLabel: provider.resultTypeKey,
          icon: provider.resultIcon,
          results: results.map((r): SearchResult => ({
            id: r.id,
            moduleId: module.id,
            title: r.title,
            subtitle: r.subtitle,
            icon: provider.resultIcon,
            path: provider.resultRoute,
            tags: r.tags,
            typeLabel: provider.resultTypeKey,
          })),
        };
      });

      const groups = (await Promise.all(searchPromises))
        .filter((g) => g.results.length > 0);

      const total = groups.reduce((sum, g) => sum + g.results.length, 0);

      return { groups, total };
    },
    enabled,
    staleTime: 30_000,
    placeholderData: EMPTY_RESULTS,
  });
}

/**
 * Parse search prefix to determine mode
 * - `>` → command mode (filter commands only)
 * - `@` → entity search (search entities across modules)
 * - `#` → tag search (filter by tags)
 * - no prefix → mixed mode (commands + entity search if query long enough)
 */
export type SearchMode = 'command' | 'entity' | 'tag' | 'mixed';

export interface ParsedSearch {
  mode: SearchMode;
  query: string;
  rawInput: string;
}

export function parseSearchInput(input: string): ParsedSearch {
  const trimmed = input.trim();

  if (trimmed.startsWith('>')) {
    return { mode: 'command', query: trimmed.slice(1).trim(), rawInput: input };
  }
  if (trimmed.startsWith('@')) {
    return { mode: 'entity', query: trimmed.slice(1).trim(), rawInput: input };
  }
  if (trimmed.startsWith('#')) {
    return { mode: 'tag', query: trimmed.slice(1).trim(), rawInput: input };
  }

  return { mode: 'mixed', query: trimmed, rawInput: input };
}
