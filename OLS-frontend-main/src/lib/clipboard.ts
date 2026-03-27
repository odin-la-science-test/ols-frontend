import { logger } from '@/lib/logger';

// ═══════════════════════════════════════════════════════════════════════════
// CLIPBOARD SERVICE — Centralized clipboard utility
// ═══════════════════════════════════════════════════════════════════════════

export const clipboard = {
  /** Copy plain text to clipboard. Returns true on success. */
  async copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      logger.warn('Clipboard copy failed', err);
      return false;
    }
  },

  /** Copy rich HTML + plain-text fallback to clipboard. Returns true on success. */
  async copyRich(html: string, plainText: string): Promise<boolean> {
    try {
      const blob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob }),
      ]);
      return true;
    } catch (err) {
      logger.warn('Clipboard copyRich failed, falling back to plain text', err);
      return this.copy(plainText);
    }
  },
};
