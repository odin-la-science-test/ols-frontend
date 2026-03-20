import api from '../axios';

// Types correspondant au DTO backend
export interface AppModuleDTO {
  moduleKey: string;
  title: string;
  icon: string;
  description: string;
  routePath: string;
  price: number | null;
  locked: boolean;
  adminOnly: boolean;
}

export type ModuleType = 'MUNIN_ATLAS' | 'HUGIN_LAB';

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
