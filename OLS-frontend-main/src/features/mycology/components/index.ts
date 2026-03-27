export { FungusDetail } from './fungus-detail';
export { FungusOverviewPanel } from './fungus-overview-panel';

// Re-export identification tools configured for mycology
import { createIdentificationTools } from '@/lib/create-identification-tools';
import { getMycologyIdentificationConfig } from '../identification-config';
import { useIdentifyByProfile, useIdentifyByApiCode } from '../hooks';
import { MYCOLOGY_ACCENT } from '../config';

export const IdentificationTools = createIdentificationTools(
  getMycologyIdentificationConfig,
  useIdentifyByProfile,
  useIdentifyByApiCode,
  { activityLogKey: 'activity.mycology.identify', activityIcon: 'leaf', accentColor: MYCOLOGY_ACCENT },
);

