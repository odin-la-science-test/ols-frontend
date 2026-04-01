import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { registry } from '@/lib/module-registry';
import { useModulesByType } from './use-modules';
import { useModuleAccessStore } from '@/stores/module-access-store';
import type { ModuleType } from '@/api';

// ═══════════════════════════════════════════════════════════════════════════
// USE HUB MODULES — Merges frontend registry (source of truth for display)
// with backend catalogue API (source of truth for business logic)
//
// Only modules registered in the frontend registry are shown.
// Unimplemented modules (no registry entry) are excluded from the hub.
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
}

export function useHubModules(type: ModuleType) {
  const { t } = useTranslation();
  const { data: apiModules, isLoading, isError, refetch } = useModulesByType(type);
  const canAccess = useModuleAccessStore((s) => s.canAccess);

  const hubModules = useMemo(() => {
    if (!apiModules) return undefined;

    return apiModules
      .filter((apiMod) => canAccess(apiMod.moduleKey) && registry.getByModuleKey(apiMod.moduleKey))
      .map((apiMod): HubModule => {
        const regMod = registry.getByModuleKey(apiMod.moduleKey)!;
        return {
          moduleKey: apiMod.moduleKey,
          title: t(regMod.translationKey),
          description: regMod.descriptionKey ? t(regMod.descriptionKey) : '',
          icon: regMod.icon,
          routePath: `/${regMod.route.path}`,
          accentColor: regMod.accentColor,
          price: apiMod.price,
          locked: apiMod.locked,
          adminOnly: apiMod.adminOnly,
        };
      });
  }, [apiModules, t, canAccess]);

  return { data: hubModules, isLoading, isError, refetch };
}
