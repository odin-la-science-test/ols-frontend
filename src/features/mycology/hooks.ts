import { createModuleHooks } from '@/hooks/create-module-hooks';
import { mycologyApi } from './api';
import type { Fungus, FungusSearchParams, FungusProfile } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// MYCOLOGY HOOKS - React Query wrappers
// ═══════════════════════════════════════════════════════════════════════════

// Create all standard hooks using the factory
const hooks = createModuleHooks<Fungus, FungusSearchParams, FungusProfile>(
  mycologyApi,
  'fungi'
);

// Export query keys
export const mycologyKeys = hooks.keys;

// Export hooks with module-specific names
export const useFungi = hooks.useList;
export const useFungus = hooks.useItem;
export const useFungiSearch = hooks.useSearch;
export const useIdentifyByProfile = hooks.useIdentifyByProfile;
export const useIdentifyByApiCode = hooks.useIdentifyByApiCode;
