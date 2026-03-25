// ═══════════════════════════════════════════════════════════════════════════
// BACTERIOLOGY TYPES - Domain-specific types
// ═══════════════════════════════════════════════════════════════════════════

import type { TFunction } from 'i18next';

export type { GramStatus, BacterialMorphology, HemolysisType } from '@/api/generated/enums';
import type { GramStatus, BacterialMorphology, HemolysisType } from '@/api/generated/enums';

export type BiochemKey = 'catalase' | 'oxydase' | 'coagulase' | 'lactose' | 'indole' | 'mannitol' | 'mobilite';

export function morphologyLabel(morpho: BacterialMorphology, t: TFunction): string {
  switch (morpho) {
    case 'COCCI': return t('scientific.morphology.cocci');
    case 'BACILLI': return t('scientific.morphology.bacilli');
    case 'SPIRAL': return t('scientific.morphology.spiral');
    case 'COCCOBACILLI': return t('scientific.morphology.coccobacilli');
  }
}

export function biochemKeyLabel(key: BiochemKey, t: TFunction): string {
  switch (key) {
    case 'catalase': return t('bacteriology.catalase');
    case 'oxydase': return t('bacteriology.oxydase');
    case 'coagulase': return t('bacteriology.coagulase');
    case 'lactose': return t('bacteriology.lactose');
    case 'indole': return t('bacteriology.indole');
    case 'mannitol': return t('bacteriology.mannitol');
    case 'mobilite': return t('bacteriology.mobility');
  }
}

// Code API avec galerie associée (bioMérieux)
export interface ApiCode {
  gallery: string;  // ex: "API 20 E", "API Staph"
  code: string;     // ex: "5144572"
}

export interface Bacterium {
  id: number;
  species: string;
  strain?: string;
  gram: GramStatus;
  morpho: BacterialMorphology;
  genomeSize?: number;
  mlst?: string;
  pathogenicity?: string;
  habitat?: string;
  
  // Biochemical profile
  catalase?: boolean;
  oxydase?: boolean;
  coagulase?: boolean;
  lactose?: boolean;
  indole?: boolean;
  mannitol?: boolean;
  mobilite?: boolean;
  hemolyse?: HemolysisType;
  
  // Genomic data
  resistanceGenes?: string[];
  virulenceFactors?: string[];
  plasmids?: string[];
  snpSignature?: number[];
  
  // Identification
  maldiProfile?: string;
  apiCodes?: ApiCode[];
  
  // Computed
  confidenceScore?: number;
}

// ─── Identification Criteria ───
export interface BiochemicalProfile {
  gram?: GramStatus;
  morpho?: BacterialMorphology;
  catalase?: boolean;
  oxydase?: boolean;
  coagulase?: boolean;
  lactose?: boolean;
  indole?: boolean;
  mannitol?: boolean;
  mobilite?: boolean;
  hemolyse?: HemolysisType;
}

// ─── API Request/Response ───
export interface BacteriumSearchParams {
  query?: string;
  gram?: GramStatus;
  morpho?: BacterialMorphology;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface IdentificationResult {
  bacterium: Bacterium;
  confidenceScore: number;
  matchedCriteria: string[];
}
