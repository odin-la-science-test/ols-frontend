import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { GenericIdentificationTools } from '@/components/modules/shared';
import type { IdentificationConfig } from '@/components/modules/shared';

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

/**
 * Creates an identification tools component with pre-configured settings.
 * This eliminates the need for wrapper components by binding the config at creation time.
 * 
 * @param getConfigFactory - Function that accepts TFunction and returns IdentificationConfig
 * @param useIdentifyByProfile - Hook for profile-based identification
 * @param useIdentifyByApiCode - Hook for API code identification
 * 
 * @returns Component configured with the provided settings
 * 
 * @example
 * // bacteriology/identification-tools.ts
 * export const IdentificationTools = createIdentificationTools(
 *   getBacteriologyIdentificationConfig,
 *   useIdentifyByProfile,
 *   useIdentifyByApiCode
 * );
 */
export function createIdentificationTools(
  getConfigFactory: (t: (key: string) => string) => IdentificationConfig,
  useIdentifyByProfile: () => { mutate: (data: unknown) => void; isPending: boolean; data?: unknown },
  useIdentifyByApiCode: () => { mutate: (data: unknown) => void; isPending: boolean; data?: unknown }
): ComponentType<IdentificationToolsProps> {
  return function IdentificationTools({ onResults, onAction }: IdentificationToolsProps) {
    const { t } = useTranslation();
    const config = getConfigFactory(t);
    
    return (
      <GenericIdentificationTools
        config={config}
        onResults={onResults}
        onAction={onAction}
        useIdentifyByProfile={useIdentifyByProfile}
        useIdentifyByApiCode={useIdentifyByApiCode}
      />
    );
  };
}

