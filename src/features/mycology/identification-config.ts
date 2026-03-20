import type { TFunction } from 'i18next';
import type { IdentificationConfig } from '@/components/modules/shared';

// ═══════════════════════════════════════════════════════════════════════════
// MYCOLOGY IDENTIFICATION CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export const getMycologyIdentificationConfig = (t: TFunction): IdentificationConfig => ({
  profileSectionTitle: t('mycology.profileSectionTitle'),
  profileSections: [
    {
      label: t('scientific.type'),
      fields: [
        {
          key: 'type',
          type: 'toggle',
          label: t('scientific.type'),
          options: [
            { value: 'LEVURES', label: t('mycology.yeasts') },
            { value: 'MOISISSURES', label: t('mycology.molds') },
            { value: 'CHAMPIGNONS_FILAMENTEUX', label: t('mycology.filamentous') },
          ],
        },
      ],
    },
    {
      label: t('scientific.category'),
      fields: [
        {
          key: 'category',
          type: 'toggle',
          label: t('scientific.category'),
          options: [
            { value: 'PATHOGENES', label: t('mycology.pathogens') },
            { value: 'COMESTIBLES', label: t('mycology.edible') },
            { value: 'TOXIQUES', label: t('mycology.toxic') },
            { value: 'MEDICINAUX', label: t('mycology.medicinal') },
            { value: 'FERMENTATION', label: t('mycology.fermentation') },
          ],
        },
      ],
    },
    {
      label: t('scientific.characteristics'),
      fields: [
        { key: 'aerobic', type: 'boolean', label: t('mycology.aerobic') },
        { key: 'dimorphic', type: 'boolean', label: t('mycology.dimorphic') },
        { key: 'encapsulated', type: 'boolean', label: t('mycology.encapsulated') },
        { key: 'melaninProducer', type: 'boolean', label: t('mycology.melanin') },
      ],
    },
  ],
  apiCodeLabel: t('scientific.apiCode'),
  apiCodePlaceholder: t('mycology.apiCodePlaceholder'),
  apiCodeValidator: (code: string) => code.length >= 3,
  apiCodeTransform: (value: string) => value.toUpperCase(),
});
