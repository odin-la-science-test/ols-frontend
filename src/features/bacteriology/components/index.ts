export { BacteriumDetail } from './bacterium-detail';
export { GramOverviewPanel } from './gram-overview-panel';

// Re-export identification tools configured for bacteriology
import { createIdentificationTools } from '@/lib/create-identification-tools';
import { getBacteriologyIdentificationConfig } from '../identification-config';
import { useIdentifyByProfile, useIdentifyByApiCode } from '../hooks';
import { BACTERIOLOGY_ACCENT } from '../config';

export const IdentificationTools = createIdentificationTools(
  getBacteriologyIdentificationConfig,
  useIdentifyByProfile,
  useIdentifyByApiCode,
  { activityLogKey: 'activity.bacteriology.identify', activityIcon: 'bug', accentColor: BACTERIOLOGY_ACCENT },
);

