// ═══════════════════════════════════════════════════════════════════════════
// QUICKSHARE TYPES - Domain types for instant sharing
// ═══════════════════════════════════════════════════════════════════════════

export type { ShareType } from '@/api/generated/enums';
import type { ShareType } from '@/api/generated/enums';

export interface SharedFileInfo {
  id: number;
  originalFilename: string;
  contentType: string | null;
  fileSize: number;
}

export interface SharedItem {
  id: number;
  shareCode: string;
  title: string | null;
  type: ShareType;

  // TEXT
  textContent: string | null;

  // FILE(s)
  files: SharedFileInfo[];

  // Metadata
  downloadCount: number;
  maxDownloads: number | null;
  expiresAt: string | null;
  createdAt: string;

  // Owner
  ownerName: string;

  // Direct recipient (if share was targeted)
  recipientEmail: string | null;

  // Computed
  expired: boolean;
  downloadLimitReached: boolean;
  shareUrl: string;
}

export interface CreateTextShareRequest {
  title?: string;
  textContent: string;
  maxDownloads?: number | null;
  expiresAt?: string | null;
  recipientEmail?: string;
}

export interface CreateFileShareParams {
  files: File[];
  title?: string;
  maxDownloads?: number | null;
  expiresAt?: string | null;
  recipientEmail?: string;
}
