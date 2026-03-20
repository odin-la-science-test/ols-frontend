export { FungusDetail } from './fungus-detail';

// Re-export identification tools configured for mycology
import { createIdentificationTools } from '@/lib/create-identification-tools';
import { getMycologyIdentificationConfig } from '../identification-config';
import { useIdentifyByProfile, useIdentifyByApiCode } from '../hooks';

export const IdentificationTools = createIdentificationTools(
  getMycologyIdentificationConfig,
  useIdentifyByProfile,
  useIdentifyByApiCode
);

