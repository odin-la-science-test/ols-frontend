import { logger } from '@/lib/logger';
import api from '@/api/axios';

// ═══════════════════════════════════════════════════════════════════════════
// OFFLINE QUEUE — Queue mutations when offline, replay when back online
//
// Infrastructure for offline-first mutation support.
// Does NOT intercept Axios calls automatically — consumers enqueue manually.
// Queued requests are persisted in localStorage and replayed in order.
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'ols-offline-queue';
const log = logger.tagged('OfflineQueue');

// ─── Types ───

interface QueuedRequest {
  method: string;
  url: string;
  data?: unknown;
  timestamp: number;
}

type OnlineListener = (isOnline: boolean) => void;

// ─── Persistence helpers ───

function loadQueue(): QueuedRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as QueuedRequest[];
  } catch {
    log.warn('Failed to load offline queue from localStorage');
    return [];
  }
}

function saveQueue(queue: QueuedRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    log.warn('Failed to save offline queue to localStorage');
  }
}

// ─── Singleton ───

class OfflineQueue {
  private _isOnline: boolean;
  private _queue: QueuedRequest[];
  private _listeners: Set<OnlineListener> = new Set();
  private _flushing = false;

  constructor() {
    this._isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this._queue = loadQueue();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this._handleOnline);
      window.addEventListener('offline', this._handleOffline);
    }
  }

  // ─── Public API ───

  get isOnline(): boolean {
    return this._isOnline;
  }

  get pendingCount(): number {
    return this._queue.length;
  }

  /**
   * Enqueue a mutation request. If online, it is NOT queued — caller should
   * execute it directly. Only call enqueue() when you know the device is offline
   * or want to defer the request.
   */
  enqueue(request: { method: string; url: string; data?: unknown }): void {
    const entry: QueuedRequest = {
      method: request.method,
      url: request.url,
      data: request.data,
      timestamp: Date.now(),
    };
    this._queue.push(entry);
    saveQueue(this._queue);
    log.info(`Enqueued ${request.method} ${request.url} (${this._queue.length} pending)`);
    this._notifyListeners();
  }

  /**
   * Replay all queued requests in FIFO order.
   * Failed requests are re-queued for next flush.
   */
  async flush(): Promise<void> {
    if (this._flushing) return;
    if (this._queue.length === 0) return;
    if (!this._isOnline) {
      log.info('Flush skipped — still offline');
      return;
    }

    this._flushing = true;
    const toReplay = [...this._queue];
    this._queue = [];
    saveQueue(this._queue);

    log.info(`Flushing ${toReplay.length} queued requests`);

    const failed: QueuedRequest[] = [];

    for (const req of toReplay) {
      try {
        await api.request({
          method: req.method,
          url: req.url,
          data: req.data,
        });
        log.debug(`Replayed ${req.method} ${req.url}`);
      } catch (err) {
        log.warn(`Failed to replay ${req.method} ${req.url}`, err);
        failed.push(req);
      }
    }

    if (failed.length > 0) {
      this._queue = [...failed, ...this._queue];
      saveQueue(this._queue);
      log.info(`${failed.length} requests re-queued after flush failure`);
    }

    this._flushing = false;
    this._notifyListeners();
  }

  /**
   * Subscribe to online status changes.
   * Returns an unsubscribe function.
   */
  subscribe(listener: OnlineListener): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  /**
   * Get a snapshot of the current online state (for useSyncExternalStore).
   */
  getSnapshot = (): boolean => {
    return this._isOnline;
  };

  /**
   * Get the current pending count (for useSyncExternalStore).
   */
  getPendingSnapshot = (): number => {
    return this._queue.length;
  };

  // ─── Private ───

  private _handleOnline = (): void => {
    this._isOnline = true;
    log.info('Back online');
    this._notifyListeners();
    void this.flush();
  };

  private _handleOffline = (): void => {
    this._isOnline = false;
    log.info('Gone offline');
    this._notifyListeners();
  };

  private _notifyListeners(): void {
    for (const listener of this._listeners) {
      listener(this._isOnline);
    }
  }
}

export const offlineQueue = new OfflineQueue();
