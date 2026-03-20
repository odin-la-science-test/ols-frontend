// ═══════════════════════════════════════════════════════════════════════════
// BACTERIOLOGY TYPES - Domain-specific types
// ═══════════════════════════════════════════════════════════════════════════

export type GramStatus = 'POSITIVE' | 'NEGATIVE';
export type BacterialMorphology = 'COCCI' | 'BACILLI' | 'SPIRAL' | 'COCCOBACILLI';
export type HemolysisType = 'ALPHA' | 'BETA' | 'GAMMA' | null;

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
