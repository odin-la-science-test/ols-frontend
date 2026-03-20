import { useQuery } from '@tanstack/react-query';
import { bacteriologyApi } from '@/features/bacteriology/api';
import { mycologyApi } from '@/features/mycology/api';
import { contactsApi } from '@/features/contacts/api';
import { notesApi } from '@/features/notes/api';
import type { Bacterium } from '@/features/bacteriology/types';
import type { Fungus } from '@/features/mycology/types';
import type { Contact } from '@/features/contacts/types';
import type { Note } from '@/features/notes/types';

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL SEARCH HOOK - Federated search across all modules
// ═══════════════════════════════════════════════════════════════════════════

export type SearchResultType = 'bacterium' | 'fungus' | 'contact' | 'note';

export interface SearchResult {
  id: number;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  icon: string;
  path: string;
  tags?: string[];
}

/** Minimum query length before searching */
const MIN_QUERY_LENGTH = 2;

/** Max results per module */
const MAX_PER_MODULE = 5;

/**
 * Map Bacterium → SearchResult
 */
function mapBacterium(b: Bacterium): SearchResult {
  return {
    id: b.id,
    type: 'bacterium',
    title: b.species,
    subtitle: [b.gram, b.morpho].filter(Boolean).join(' · '),
    icon: 'Microscope',
    path: '/atlas/bacteriology',
    tags: b.resistanceGenes?.slice(0, 3),
  };
}

/**
 * Map Fungus → SearchResult
 */
function mapFungus(f: Fungus): SearchResult {
  return {
    id: f.id,
    type: 'fungus',
    title: f.species,
    subtitle: [f.type, f.category].filter(Boolean).join(' · '),
    icon: 'Flame',
    path: '/atlas/mycology',
    tags: f.secondaryMetabolites?.slice(0, 3),
  };
}

/**
 * Map Contact → SearchResult
 */
function mapContact(c: Contact): SearchResult {
  return {
    id: c.id,
    type: 'contact',
    title: `${c.firstName} ${c.lastName}`,
    subtitle: [c.organization, c.jobTitle].filter(Boolean).join(' · '),
    icon: 'Users',
    path: '/lab/contacts',
  };
}

/**
 * Map Note → SearchResult
 */
function mapNote(n: Note): SearchResult {
  return {
    id: n.id,
    type: 'note',
    title: n.title,
    subtitle: n.content ? n.content.slice(0, 80) + (n.content.length > 80 ? '…' : '') : undefined,
    icon: 'NotebookPen',
    path: '/lab/notes',
    tags: n.tags?.slice(0, 3),
  };
}

/**
 * Federated search result container
 */
export interface GlobalSearchResults {
  bacteria: SearchResult[];
  fungi: SearchResult[];
  contacts: SearchResult[];
  notes: SearchResult[];
  total: number;
}

const EMPTY_RESULTS: GlobalSearchResults = {
  bacteria: [],
  fungi: [],
  contacts: [],
  notes: [],
  total: 0,
};

/**
 * Search a single module safely — returns empty array on error
 */
async function searchModule<T>(
  searchFn: () => Promise<{ data: T[] }>,
  mapFn: (item: T) => SearchResult,
  max: number,
): Promise<SearchResult[]> {
  try {
    const { data } = await searchFn();
    return data.slice(0, max).map(mapFn);
  } catch {
    return [];
  }
}

/**
 * Hook: federated search across all modules
 * - mode 'entity' → all modules (bacteria, fungi, contacts, notes)
 * - mode 'tag'    → notes only (backend searches in tags field)
 * Only fires when query length >= MIN_QUERY_LENGTH
 */
export function useGlobalSearch(query: string, mode: SearchMode = 'entity') {
  const trimmed = query.trim();
  const enabled = trimmed.length >= MIN_QUERY_LENGTH;

  return useQuery<GlobalSearchResults>({
    queryKey: ['global-search', mode, trimmed],
    queryFn: async (): Promise<GlobalSearchResults> => {
      if (mode === 'tag') {
        // Tags are only relevant for notes (backend searches in tags field)
        const notes = await searchModule(
          () => notesApi.search(trimmed),
          mapNote,
          MAX_PER_MODULE,
        );
        return { bacteria: [], fungi: [], contacts: [], notes, total: notes.length };
      }

      // Entity mode: search across all modules in parallel
      const [bacteria, fungi, contacts, notes] = await Promise.all([
        searchModule(() => bacteriologyApi.search(trimmed), mapBacterium, MAX_PER_MODULE),
        searchModule(() => mycologyApi.search(trimmed), mapFungus, MAX_PER_MODULE),
        searchModule(() => contactsApi.search(trimmed), mapContact, MAX_PER_MODULE),
        searchModule(() => notesApi.search(trimmed), mapNote, MAX_PER_MODULE),
      ]);

      return {
        bacteria,
        fungi,
        contacts,
        notes,
        total: bacteria.length + fungi.length + contacts.length + notes.length,
      };
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
