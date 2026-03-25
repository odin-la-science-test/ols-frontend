import type { TFunction } from 'i18next';
import type { IdentificationConfig } from '@/components/modules/shared';

// ═══════════════════════════════════════════════════════════════════════════
// BACTERIOLOGY IDENTIFICATION CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export const getBacteriologyIdentificationConfig = (t: TFunction): IdentificationConfig => ({
  profileSectionTitle: t('scientific.biochemicalProfile'),
  profileSections: [
    {
      label: t('scientific.gram'),
      fields: [
        {
          key: 'gram',
          type: 'toggle',
          label: t('scientific.gram'),
          options: [
            { value: 'POSITIVE', label: t('scientific.gramPositive'), variant: 'positive' },
            { value: 'NEGATIVE', label: t('scientific.gramNegative'), variant: 'negative' },
          ],
        },
      ],
    },
    {
      label: t('scientific.morphology.label'),
      fields: [
        {
          key: 'morpho',
          type: 'toggle',
          label: t('scientific.morphology.label'),
          options: [
            { value: 'COCCI', label: t('scientific.morphology.cocci') },
            { value: 'BACILLI', label: t('scientific.morphology.bacilli') },
            { value: 'SPIRAL', label: t('scientific.morphology.spiral') },
          ],
        },
      ],
    },
    {
      label: t('scientific.biochemicalProfile'),
      fields: [
        { key: 'catalase', type: 'boolean', label: t('bacteriology.catalase') },
        { key: 'oxydase', type: 'boolean', label: t('bacteriology.oxydase') },
        { key: 'coagulase', type: 'boolean', label: t('bacteriology.coagulase') },
        { key: 'lactose', type: 'boolean', label: t('bacteriology.lactose') },
        { key: 'indole', type: 'boolean', label: t('bacteriology.indole') },
        { key: 'mannitol', type: 'boolean', label: t('bacteriology.mannitol') },
      ],
    },
    {
      label: t('scientific.hemolysis'),
      fields: [
        {
          key: 'hemolyse',
          type: 'toggle',
          label: t('scientific.hemolysis'),
          options: [
            { value: 'ALPHA', label: t('scientific.hemolysisAlpha') },
            { value: 'BETA', label: t('scientific.hemolysisB') },
            { value: 'GAMMA', label: t('scientific.hemolysisGamma') },
          ],
        },
      ],
    },
  ],
  apiCodeLabel: t('scientific.apiCodeLabel'),
  apiCodePlaceholder: t('bacteriology.apiCodePlaceholder'),
  apiCodeValidator: (code: string) => /^\d{7}$/.test(code),
  apiCodeTransform: (value: string) => value.replace(/\D/g, '').slice(0, 7),
});
