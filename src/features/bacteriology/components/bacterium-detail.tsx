'use client';

import {
  Bug,
  Dna,
  FlaskConical,
  Microscope,
  AlertTriangle,
  Fingerprint,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DetailPanelContent,
  DetailSection,
  DetailRow,
  DetailTags,
  DetailCodeList,
  Badge,
  BooleanValueRow
} from '@/components/modules';
import type { Bacterium } from '../types';
import { getGramLabels, getMorphoLabels } from '../config';

// ═══════════════════════════════════════════════════════════════════════════
// BACTERIUM DETAIL - Detailed view of a bacterium
// Renders content for CollectionLayout's detail portal
// ═══════════════════════════════════════════════════════════════════════════

interface BacteriumDetailProps {
  bacterium: Bacterium;
  onClose: () => void;
}

export function BacteriumDetail({ bacterium }: BacteriumDetailProps) {
  const { t } = useTranslation();
  const gramLabels = getGramLabels(t);
  const morphoLabels = getMorphoLabels(t);

  return (
    <DetailPanelContent
      title={bacterium.species}
      subtitle={bacterium.strain}
      icon={Bug}
      badge={
        <Badge variant={bacterium.gram === 'POSITIVE' ? 'gramPositive' : 'gramNegative'}>
          {gramLabels[bacterium.gram]}
        </Badge>
      }
    >
      <div className="space-y-6">
        {/* Classification */}
        <DetailSection title={t('scientific.classification')} icon={Microscope}>
          <DetailRow label={t('scientific.species')} value={<span className="italic">{bacterium.species}</span>} />
          <DetailRow label={t('scientific.strain')} value={bacterium.strain} />
          <DetailRow
            label={t('scientific.morphology.label')}
            value={
              bacterium.morpho ? (
                <Badge variant={bacterium.morpho === 'COCCI' ? 'coccus' : 'bacillus'}>
                  {morphoLabels[bacterium.morpho]}
                </Badge>
              ) : null
            }
          />
          <DetailRow label="MLST" value={bacterium.mlst} copyable />
        </DetailSection>

        {/* Biochemical Profile */}
        <DetailSection title={t('scientific.biochemicalProfile')} icon={FlaskConical}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <BooleanValueRow label={t('bacteriology.catalase')} value={bacterium.catalase} />
            <BooleanValueRow label={t('bacteriology.oxydase')} value={bacterium.oxydase} />
            <BooleanValueRow label={t('bacteriology.coagulase')} value={bacterium.coagulase} />
            <BooleanValueRow label={t('bacteriology.lactose')} value={bacterium.lactose} />
            <BooleanValueRow label={t('bacteriology.indole')} value={bacterium.indole} />
            <BooleanValueRow label={t('bacteriology.mannitol')} value={bacterium.mannitol} />
            <BooleanValueRow label={t('bacteriology.mobility')} value={bacterium.mobilite} />
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-muted-foreground">{t('scientific.hemolysis')}</span>
              <Badge variant="secondary" size="sm">
                {bacterium.hemolyse || '—'}
              </Badge>
            </div>
          </div>
        </DetailSection>

        {/* Identification Codes */}
        <DetailSection title={t('scientific.identification')} icon={Fingerprint}>
          <DetailCodeList label={t('scientific.apiCode')} codes={bacterium.apiCodes} />
          <DetailRow label={t('scientific.maldiProfile')} value={bacterium.maldiProfile} copyable />
        </DetailSection>

        {/* Genomic Data */}
        {(bacterium.genomeSize || bacterium.resistanceGenes?.length || bacterium.virulenceFactors?.length) && (
          <DetailSection title={t('scientific.genomicData')} icon={Dna}>
            {bacterium.genomeSize && (
              <DetailRow
                label={t('scientific.genomeSize')}
                value={`${bacterium.genomeSize.toFixed(2)} Mb`}
              />
            )}
            <DetailTags
              label={t('scientific.resistanceGenes')}
              tags={bacterium.resistanceGenes || []}
              variant="destructive"
            />
            <DetailTags
              label={t('scientific.virulenceFactors')}
              tags={bacterium.virulenceFactors || []}
              variant="warning"
            />
            <DetailTags
              label={t('scientific.plasmids')}
              tags={bacterium.plasmids || []}
              variant="molecule"
            />
          </DetailSection>
        )}

        {/* Clinical Info */}
        <DetailSection title={t('scientific.clinicalInfo')} icon={AlertTriangle}>
          <DetailRow label={t('scientific.pathogenicity')} value={bacterium.pathogenicity} />
          <DetailRow label={t('scientific.habitat')} value={bacterium.habitat} />
        </DetailSection>
      </div>
    </DetailPanelContent>
  );
}
