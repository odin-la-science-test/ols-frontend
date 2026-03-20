export { BacteriumDetail } from './bacterium-detail';
export { GramOverviewPanel } from './gram-overview-panel';

// Re-export identification tools configured for bacteriology
import { createIdentificationTools } from '@/lib/create-identification-tools';
import { getBacteriologyIdentificationConfig } from '../identification-config';
import { useIdentifyByProfile, useIdentifyByApiCode } from '../hooks';

export const IdentificationTools = createIdentificationTools(
  getBacteriologyIdentificationConfig,
  useIdentifyByProfile,
  useIdentifyByApiCode
);

