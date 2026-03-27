import type { TFunction } from 'i18next';

/**
 * Format a date or timestamp as a short relative time string.
 * Uses i18n keys: dashboard.timeJustNow, dashboard.timeMinutes, dashboard.timeHours, dashboard.timeDays.
 */
export function formatRelativeTime(dateOrTimestamp: string | number, t: TFunction): string {
  const ts = typeof dateOrTimestamp === 'string' ? new Date(dateOrTimestamp).getTime() : dateOrTimestamp;
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return t('dashboard.timeJustNow');
  if (minutes < 60) return t('dashboard.timeMinutes', { count: minutes });
  if (hours < 24) return t('dashboard.timeHours', { count: hours });
  return t('dashboard.timeDays', { count: days });
}
