import api from '@/api/axios';
import { createModuleApi } from '@/api/module-api-factory';
import type { 
  Bacterium, 
  BacteriumSearchParams, 
  BiochemicalProfile,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// BACTERIOLOGY API - REST endpoints
// ═══════════════════════════════════════════════════════════════════════════

export const bacteriologyApi = createModuleApi<Bacterium, BacteriumSearchParams, BiochemicalProfile>(
  api,
  '/bacteria'
);
