import { useCallback, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { GenericIdentificationTools } from '@/components/modules/shared';
import type { IdentificationConfig } from '@/components/modules/shared';
import { useActivityLog } from '@/hooks/use-activity-log';

// ═══════════════════════════════════════════════════════════════════════════
// CREATE IDENTIFICATION TOOLS - Factory for identification tools
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Props for identification tools component
 */
interface IdentificationToolsProps {
  onResults?: (results: unknown[]) => void;
  onAction?: () => void;
}

interface IdentificationToolsOptions {
  /** i18n key for the activity log message (e.g. 'activity.bacteriology.identify') */
  activityLogKey: string;
  /** Lucide icon name for the activity log entry */
  activityIcon: string;
  /** Module accent color for the activity log entry */
  accentColor: string;
}

/**
 * Creates an identification tools component with pre-configured settings.
 * This eliminates the need for wrapper components by binding the config at creation time.
 *
 * @param getConfigFactory - Function that accepts TFunction and returns IdentificationConfig
 * @param useIdentifyByProfile - Hook for profile-based identification
 * @param useIdentifyByApiCode - Hook for API code identification
 * @param options - Activity log configuration
 *
 * @returns Component configured with the provided settings
 *
 * @example
 * // bacteriology/identification-tools.ts
 * export const IdentificationTools = createIdentificationTools(
 *   getBacteriologyIdentificationConfig,
 *   useIdentifyByProfile,
 *   useIdentifyByApiCode,
 *   { activityLogKey: 'activity.bacteriology.identify', activityIcon: 'bug', accentColor: MUNIN_PRIMARY }
 * );
 */
export function createIdentificationTools(
  getConfigFactory: (t: TFunction) => IdentificationConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useIdentifyByProfile: () => { mutate: (data: any) => void; isPending: boolean; data?: unknown },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useIdentifyByApiCode: () => { mutate: (data: any) => void; isPending: boolean; data?: unknown },
  options?: IdentificationToolsOptions,
): ComponentType<IdentificationToolsProps> {
  return function IdentificationTools({ onResults, onAction }: IdentificationToolsProps) {
    const { t } = useTranslation();
    const { log } = useActivityLog();
    const config = getConfigFactory(t);

    const handleResults = useCallback((results: unknown[]) => {
      if (options) {
        log({ type: 'data', message: t(options.activityLogKey), icon: options.activityIcon, accentColor: options.accentColor });
      }
      onResults?.(results);
    }, [log, t, onResults]);

    return (
      <GenericIdentificationTools
        config={config}
        onResults={handleResults}
        onAction={onAction}
        useIdentifyByProfile={useIdentifyByProfile}
        useIdentifyByApiCode={useIdentifyByApiCode}
      />
    );
  };
}

