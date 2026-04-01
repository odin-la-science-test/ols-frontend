import { logger } from '@/lib/logger';

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT UTILITIES — Generic data export (CSV, JSON)
// ═══════════════════════════════════════════════════════════════════════════

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCsv<T extends Record<string, unknown>>(data: T[], filename: string): void {
  if (data.length === 0) {
    logger.warn('exportToCsv: empty data, nothing to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const escape = (val: unknown): string => {
    const str = String(val ?? '');
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const lines = [
    headers.join(','),
    ...data.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

export function exportToJson<T>(data: T[], filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
}
