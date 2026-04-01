import { create } from 'zustand';
import api from '@/api/axios';
import { logger } from '@/lib/logger';

interface ModuleAccessState {
  accessibleKeys: Set<string>;
  loaded: boolean;
  fetchAccess: () => Promise<void>;
  canAccess: (moduleKey: string) => boolean;
}

export const useModuleAccessStore = create<ModuleAccessState>()((set, get) => ({
  accessibleKeys: new Set<string>(),
  loaded: false,

  fetchAccess: async () => {
    try {
      const response = await api.get<string[]>('/modules/accessible');
      set({ accessibleKeys: new Set(response.data), loaded: true });
      logger.debug('[module-access] Loaded accessible modules', response.data);
    } catch (error) {
      logger.error('[module-access] Failed to fetch accessible modules', error);
      // On error, mark as loaded but with empty set — canAccess returns true when not loaded
      set({ loaded: true });
    }
  },

  canAccess: (moduleKey: string) => {
    const { loaded, accessibleKeys } = get();
    // If not loaded yet, return true to avoid blocking the UI
    if (!loaded) return true;
    return accessibleKeys.has(moduleKey);
  },
}));
