import api from './axios';

export interface CorrectionRequest {
  text: string;
  language?: string;
}

export interface CorrectionDto {
  offset: number;
  length: number;
  message: string;
  replacements: string[];
  original: string;
}

export interface CorrectionResponse {
  correctedText: string;
  corrections: CorrectionDto[];
  correctionCount: number;
}

export const aiApi = {
  correctText: (data: CorrectionRequest) =>
    api.post<CorrectionResponse>('/ai/correct', data),
};
