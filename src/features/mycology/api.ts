import api from '@/api/axios';
import { createModuleApi } from '@/api/module-api-factory';
import type { 
  Fungus, 
  FungusSearchParams, 
  FungusProfile,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// MYCOLOGY API - REST endpoints
// ═══════════════════════════════════════════════════════════════════════════

export const mycologyApi = createModuleApi<Fungus, FungusSearchParams, FungusProfile>(
  api,
  '/fungi'
);
