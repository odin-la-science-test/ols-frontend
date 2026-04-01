import { ColumnDef } from '../types';

/**
 * Filter columns to include 'confidenceScore' only if data contains scores.
 */
export function filterConfidenceColumn<T extends { confidenceScore?: number | null }>(
  columns: ColumnDef<T>[],
  data: T[]
): ColumnDef<T>[] {
  const hasScore = data.some(item => item.confidenceScore != null);
  if (!hasScore) {
    return columns.filter(col => col.key !== 'confidenceScore');
  }
  return columns;
}

/**
 * Add 'confidenceScore' to export columns if data contains scores.
 * Inserts at index 2 by default.
 */
export function addConfidenceExportColumn<T extends { confidenceScore?: number | null }>(
  columns: Array<{ key: keyof T; header: string }>,
  data: T[],
  insertIndex = 2
): Array<{ key: keyof T; header: string }> {
  const hasScore = data.some(item => item.confidenceScore != null);
  
  if (hasScore) {
    const newColumns = [...columns];
    newColumns.splice(insertIndex, 0, { 
      key: 'confidenceScore' as keyof T, 
      header: 'Score de confiance (%)' 
    });
    return newColumns;
  }
  
  return columns;
}
