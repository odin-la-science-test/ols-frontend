import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { registry } from '@/lib/module-registry';
import { useModulesByType } from './use-modules';
import type { ModuleType } from '@/api';

// ═══════════════════════════════════════════════════════════════════════════
// USE HUB MODULES — Merges frontend registry (source of truth for display)
// with backend catalogue API (source of truth for business logic)
//
// Implemented modules: icon, route, title, description from registry (i18n)
// Not-yet-implemented modules: fallback to API data
// ═══════════════════════════════════════════════════════════════════════════

export interface HubModule {
  moduleKey: string;
  title: string;
  description: string;
  icon: string;
  routePath: string;
  accentColor: string;
  price: number | null;
  locked: boolean;
  adminOnly: boolean;
  implemented: boolean;
}

const PLATFORM_ACCENT: Record<string, string> = {
  MUNIN_ATLAS: 'hsl(262, 83%, 58%)',
  HUGIN_LAB: 'hsl(160, 84%, 39%)',
};

export function useHubModules(type: ModuleType) {
  const { t } = useTranslation();
  const { data: apiModules, isLoading, isError, refetch } = useModulesByType(type);
  const defaultAccent = PLATFORM_ACCENT[type] ?? '';

  const hubModules = useMemo(() => {
    if (!apiModules) return undefined;

    return apiModules.map((apiMod): HubModule => {
      const regMod = registry.getByModuleKey(apiMod.moduleKey);

      if (regMod) {
        return {
          moduleKey: apiMod.moduleKey,
          title: t(regMod.translationKey),
          description: regMod.descriptionKey ? t(regMod.descriptionKey) : apiMod.description,
          icon: regMod.icon,
          routePath: `/${regMod.route.path}`,
          accentColor: regMod.accentColor,
          price: apiMod.price,
          locked: apiMod.locked,
          adminOnly: apiMod.adminOnly,
          implemented: true,
        };
      }

      return {
        moduleKey: apiMod.moduleKey,
        title: apiMod.title,
        description: apiMod.description,
        icon: 'help-circle',
        routePath: '#',
        accentColor: defaultAccent,
        price: apiMod.price,
        locked: true,
        adminOnly: apiMod.adminOnly,
        implemented: false,
      };
    });
  }, [apiModules, t, defaultAccent]);

  return { data: hubModules, isLoading, isError, refetch };
}
