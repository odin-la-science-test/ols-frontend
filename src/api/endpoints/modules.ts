import api from '../axios';

// Types correspondant au DTO backend
export interface AppModuleDTO {
  moduleKey: string;
  price: number | null;
  locked: boolean;
  adminOnly: boolean;
}

export type { ModuleType } from '@/api/generated/enums';
import type { ModuleType } from '@/api/generated/enums';

export const modulesApi = {
  /**
   * Récupère tous les modules du catalogue
   */
  getAll: () => 
    api.get<AppModuleDTO[]>('/modules'),
  
  /**
   * Récupère les modules par type (MUNIN_ATLAS ou HUGIN_LAB)
   */
  getByType: (type: ModuleType) => 
    api.get<AppModuleDTO[]>(`/modules/type/${type}`),
  
  /**
   * Récupère un module spécifique par sa clé
   */
  getByKey: (key: string) => 
    api.get<AppModuleDTO>(`/modules/${key}`),
};
