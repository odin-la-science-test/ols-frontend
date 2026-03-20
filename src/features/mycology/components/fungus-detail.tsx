'use client';

import { 
  Sprout, 
  FlaskConical, 
  Microscope, 
  AlertTriangle,
  Fingerprint,
  Thermometer,
  Dna,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  DetailPanel, 
  DetailSection, 
  DetailRow, 
  DetailTags,
  DetailCodeList,
  Badge,
  BooleanValueRow
} from '@/components/modules';
import type { Fungus } from '../types';
import { getFungusTypeLabels, getFungusCategoryLabels } from '../config';

// ═══════════════════════════════════════════════════════════════════════════
// FUNGUS DETAIL - Detailed view of a fungus
// ═══════════════════════════════════════════════════════════════════════════

interface FungusDetailProps {
  fungus: Fungus | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FungusDetail({ fungus, isOpen, onClose }: FungusDetailProps) {
  const { t } = useTranslation();
  const fungusTypeLabels = getFungusTypeLabels(t);
  const fungusCategoryLabels = getFungusCategoryLabels(t);
  
  if (!fungus) return null;

  return (
    <DetailPanel
      isOpen={isOpen}
      onClose={onClose}
      title={fungus.species}
      subtitle={fungus.description}
      icon={Sprout}
      badge={
        fungus.category ? (
          <Badge variant={
            fungus.category === 'PATHOGENES' || fungus.category === 'TOXIQUES' 
              ? 'destructive' 
              : fungus.category === 'MEDICINAUX' || fungus.category === 'COMESTIBLES'
              ? 'success'
              : 'secondary'
          }>
            {fungusCategoryLabels[fungus.category]}
          </Badge>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {/* Classification */}
        <DetailSection title={t('scientific.classification')} icon={Microscope}>
          <DetailRow label={t('scientific.species')} value={<span className="italic">{fungus.species}</span>} />
          <DetailRow 
            label={t('scientific.type')} 
            value={
              fungus.type ? (
                <Badge variant={
                  fungus.type === 'LEVURES' ? 'yeast' : 
                  fungus.type === 'MOISISSURES' ? 'mold' : 
                  'filamentous'
                }>
                  {fungusTypeLabels[fungus.type]}
                </Badge>
              ) : null
            } 
          />
          <DetailRow 
            label={t('scientific.category')} 
            value={
              fungus.category ? (
                <Badge variant="secondary">
                  {fungusCategoryLabels[fungus.category]}
                </Badge>
              ) : null
            } 
          />
          <DetailRow label={t('scientific.morphology.label')} value={fungus.morphology} />
          <DetailRow label={t('scientific.reproduction')} value={fungus.reproduction} />
        </DetailSection>

        {/* Characteristics */}
        <DetailSection title={t('scientific.characteristics')} icon={FlaskConical}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <BooleanValueRow label={t('mycology.aerobic')} value={fungus.aerobic} />
            <BooleanValueRow label={t('mycology.dimorphic')} value={fungus.dimorphic} />
            <BooleanValueRow label={t('mycology.encapsulated')} value={fungus.encapsulated} />
            <BooleanValueRow label={t('mycology.melaninProducer')} value={fungus.melaninProducer} />
          </div>
        </DetailSection>

        {/* Growth Conditions */}
        {(fungus.optimalTemperature || fungus.maximalTemperature || fungus.cultureMedium) && (
          <DetailSection title={t('scientific.growthConditions')} icon={Thermometer}>
            {fungus.optimalTemperature && (
              <DetailRow 
                label={t('scientific.optimalTemperature')} 
                value={`${fungus.optimalTemperature}°C`} 
              />
            )}
            {fungus.maximalTemperature && (
              <DetailRow 
                label={t('scientific.maximalTemperature')} 
                value={`${fungus.maximalTemperature}°C`} 
              />
            )}
            <DetailRow label={t('scientific.cultureMedium')} value={fungus.cultureMedium} />
          </DetailSection>
        )}

        {/* Identification */}
        <DetailSection title={t('scientific.identification')} icon={Fingerprint}>
          <DetailCodeList label={t('scientific.apiCode')} codes={fungus.apiCodes} />
        </DetailSection>

        {/* Biochemical Profile */}
        {(fungus.metabolism || fungus.secondaryMetabolites?.length || fungus.enzymes?.length || fungus.degradableSubstrates?.length) && (
          <DetailSection title={t('scientific.biochemicalProfile')} icon={Dna}>
            <DetailRow label={t('scientific.metabolism')} value={fungus.metabolism} />
            <DetailTags 
              label={t('scientific.secondaryMetabolites')} 
              tags={fungus.secondaryMetabolites || []} 
              variant="molecule"
            />
            <DetailTags 
              label={t('scientific.enzymes')} 
              tags={fungus.enzymes || []} 
              variant="success"
            />
            <DetailTags 
              label={t('scientific.degradableSubstrates')} 
              tags={fungus.degradableSubstrates || []} 
              variant="default"
            />
          </DetailSection>
        )}

        {/* Clinical & Applications */}
        <DetailSection title={t('scientific.clinicalInfo')} icon={AlertTriangle}>
          <DetailRow label={t('scientific.pathogenicity')} value={fungus.pathogenicity} />
          <DetailRow label={t('scientific.habitat')} value={fungus.habitat} />
          <DetailRow label={t('scientific.applications')} value={fungus.applications} />
          <DetailTags 
            label={t('scientific.hosts')} 
            tags={fungus.hosts || []} 
            variant="warning"
          />
          <DetailRow label={t('scientific.toxins')} value={fungus.toxins} />
          <DetailRow label={t('scientific.allergens')} value={fungus.allergens} />
        </DetailSection>
      </div>
    </DetailPanel>
  );
}
