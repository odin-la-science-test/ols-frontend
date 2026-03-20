import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ═══════════════════════════════════════════════════════════════════════════
// CSV EXPORT UTILITY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Escapes a CSV field value to handle special characters
 */
function escapeCSVField(value: unknown): string {
  if (value === null || value === undefined) return '';
  
  // Handle arrays of objects (like ApiCode[])
  if (Array.isArray(value)) {
    const formatted = value.map(item => {
      if (typeof item === 'object' && item !== null) {
        // Special handling for ApiCode objects
        if ('gallery' in item && 'code' in item) {
          return `${item.gallery}: ${item.code}`;
        }
        return JSON.stringify(item);
      }
      return String(item);
    }).join(' | ');
    
    if (formatted.includes(',') || formatted.includes('"') || formatted.includes('\n')) {
      return `"${formatted.replace(/"/g, '""')}"`;
    }
    return formatted;
  }
  
  const str = String(value);
  
  // If the field contains comma, quote, or newline, wrap it in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Exports data to CSV file and triggers download
 * 
 * @param data - Array of objects to export
 * @param filename - Name of the file to download (without extension)
 * @param columns - Optional array of column configurations. If not provided, all object keys are used.
 * 
 * @example
 * exportToCSV(bacteria, 'bacteria', [
 *   { key: 'id', header: 'ID' },
 *   { key: 'species', header: 'Species' },
 *   { key: 'gram', header: 'Gram Type' }
 * ]);
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: Array<{ key: keyof T; header: string }>
) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // If no columns specified, use all keys from first object
  const cols = columns || Object.keys(data[0]).map(key => ({
    key: key as keyof T,
    header: key
  }));

  // Build CSV header
  const headers = cols.map(col => escapeCSVField(col.header)).join(',');

  // Build CSV rows
  const rows = data.map(item => 
    cols.map(col => escapeCSVField(item[col.key])).join(',')
  );

  // Combine header and rows
  const csv = [headers, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}
