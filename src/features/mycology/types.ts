// ═══════════════════════════════════════════════════════════════════════════
// MYCOLOGY TYPES - Domain-specific types
// ═══════════════════════════════════════════════════════════════════════════

export type FungusType = 'LEVURES' | 'MOISISSURES' | 'CHAMPIGNONS_FILAMENTEUX';
export type FungusCategory = 
  | 'PATHOGENES' 
  | 'COMESTIBLES' 
  | 'TOXIQUES' 
  | 'MEDICINAUX' 
  | 'FERMENTATION' 
  | 'CULTURE' 
  | 'DIAGNOSTIC';

// Code API avec galerie associée (bioMérieux)
export interface ApiCode {
  gallery: string;  // ex: "API 20 C AUX", "API ID 32 C"
  code: string;     // ex: "2576174"
}

export interface Fungus {
  id: number;
  species: string;
  type?: FungusType;
  category?: FungusCategory;
  description?: string;
  habitat?: string;
  morphology?: string;
  optimalTemperature?: number;
  maximalTemperature?: number;
  applications?: string;
  metabolism?: string;
  pathogenicity?: string;
  cultureMedium?: string;
  
  // Identification
  apiCodes?: ApiCode[];
  
  // Characteristics
  aerobic?: boolean;
  dimorphic?: boolean;
  encapsulated?: boolean;
  melaninProducer?: boolean;
  reproduction?: string;
  
  // Biochemical
  secondaryMetabolites?: string[];
  enzymes?: string[];
  degradableSubstrates?: string[];
  
  // Clinical
  hosts?: string[];
  toxins?: string;
  allergens?: string;
  
  // Computed
  confidenceScore?: number;
}

// ─── Identification Criteria ───
export interface FungusProfile {
  type?: FungusType;
  category?: FungusCategory;
  aerobic?: boolean;
  dimorphic?: boolean;
  encapsulated?: boolean;
  melaninProducer?: boolean;
}

// ─── API Request/Response ───
export interface FungusSearchParams {
  query?: string;
  type?: FungusType;
  category?: FungusCategory;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface IdentificationResult {
  fungus: Fungus;
  confidenceScore: number;
  matchedCriteria: string[];
}
