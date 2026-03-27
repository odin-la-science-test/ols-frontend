import { useEffect, type ReactNode } from 'react';
import { registry } from '@/lib/module-registry';
import { logger } from '@/lib/logger';
import { useProgressStore } from '@/stores/progress-store';

interface Props {
  moduleId: string;
  children: ReactNode;
}

export function ModuleLifecycleWrapper({ moduleId, children }: Props) {
  const lifecycle = registry.getById(moduleId)?.lifecycle;

  useEffect(() => {
    useProgressStore.getState().trackModuleVisit(moduleId);

    if (!lifecycle?.onActivate) return;
    logger.debug(`[lifecycle] Activating module "${moduleId}"`);
    const cleanup = lifecycle.onActivate();
    return () => {
      if (typeof cleanup === 'function') cleanup();
      lifecycle.onDeactivate?.();
      logger.debug(`[lifecycle] Deactivated module "${moduleId}"`);
    };
  }, [moduleId]); // eslint-disable-line react-hooks/exhaustive-deps -- lifecycle is stable per module

  return <>{children}</>;
}
