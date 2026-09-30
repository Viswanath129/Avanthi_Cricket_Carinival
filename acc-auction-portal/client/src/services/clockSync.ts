/**
 * ClockSync Service — ACC 2026 Zero-Latency NTP-Style Time Synchronization
 *
 * Algorithm:
 * - Samples server time every 10s or on trigger events (mount, visible, online, bid, draw)
 * - Records { offset, rtt } for last 8 samples
 * - Discards samples with rtt > 500ms
 * - Computes median offset of remaining samples
 * - Applies exponential smoothing: offset = 0.7 * old + 0.3 * new
 * - If jump > 500ms, applies immediately
 * - Accuracy bound: ±Math.round(minRtt / 2) ms
 */

export interface ClockSample {
  offset: number;
  rtt: number;
  timestamp: number;
}

export interface ClockSyncState {
  offset: number;
  rtt: number;
  synced: boolean;
  accuracy: number; // ±ms
  samplesCount: number;
}

type SyncListener = (state: ClockSyncState) => void;

class ClockSyncService {
  private samples: ClockSample[] = [];
  private currentOffset = 0;
  private currentRtt = 0;
  private isSynced = false;
  private listeners: Set<SyncListener> = new Set();
  private intervalId: any = null;
  private isProbing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initTriggers();
    }
  }

  private initTriggers(): void {
    // Initial sync
    this.probe();

    // 10-second periodic sync
    this.intervalId = setInterval(() => {
      this.probe();
    }, 10000);

    // Tab visibility recovery
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.probe();
      }
    });

    // Network reconnection
    window.addEventListener('online', () => {
      this.probe();
    });
  }

  public async probe(): Promise<void> {
    if (this.isProbing) return;
    this.isProbing = true;

    const t0 = Date.now();
    try {
      // 1. Try dedicated time endpoint or timestamp probe
      const res = await fetch(`/api/time?echo=${t0}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      }).catch(() => null);

      const t3 = Date.now();
      const rtt = Math.max(1, t3 - t0);

      let serverNow = t0;
      if (res && res.ok) {
        const data = await res.json();
        serverNow = Number(data.serverNow) || Date.now();
      } else {
        // Fallback: estimate from server header or RTDB offset
        const dateHeader = res ? res.headers.get('date') : null;
        serverNow = dateHeader ? new Date(dateHeader).getTime() : Date.now();
      }

      // Discard network hiccups (> 500ms)
      if (rtt <= 500) {
        const offset = serverNow - Math.round((t0 + t3) / 2);
        this.addSample({ offset, rtt, timestamp: t3 });
      }
    } catch {
      // Network drop handled gracefully
    } finally {
      this.isProbing = false;
    }
  }

  public addSample(sample: ClockSample): void {
    this.samples.push(sample);
    if (this.samples.length > 8) {
      this.samples.shift();
    }

    // Filter valid samples
    const validSamples = this.samples.filter((s) => s.rtt <= 500);
    if (validSamples.length === 0) return;

    // Median offset
    const sortedOffsets = validSamples.map((s) => s.offset).sort((a, b) => a - b);
    const mid = Math.floor(sortedOffsets.length / 2);
    const medianOffset =
      sortedOffsets.length % 2 !== 0
        ? sortedOffsets[mid]
        : Math.round((sortedOffsets[mid - 1] + sortedOffsets[mid]) / 2);

    // Min RTT for accuracy bounds
    const minRtt = Math.min(...validSamples.map((s) => s.rtt));
    this.currentRtt = minRtt;

    if (!this.isSynced) {
      this.currentOffset = medianOffset;
      this.isSynced = true;
    } else {
      const delta = Math.abs(medianOffset - this.currentOffset);
      if (delta > 500) {
        // Abrupt shift: apply immediately
        this.currentOffset = medianOffset;
      } else {
        // Exponential smoothing
        this.currentOffset = Math.round(0.7 * this.currentOffset + 0.3 * medianOffset);
      }
    }

    this.notify();
  }

  public applyExternalOffset(offset: number): void {
    // Allows RTDB .info/serverTimeOffset to seed or correct
    if (typeof offset !== 'number') return;
    this.addSample({
      offset: Math.round(offset),
      rtt: 20, // High quality synthetic RTDB estimate
      timestamp: Date.now(),
    });
  }

  public getState(): ClockSyncState {
    const minRtt = this.samples.length > 0 ? Math.min(...this.samples.map((s) => s.rtt)) : 50;
    return {
      offset: this.currentOffset,
      rtt: this.currentRtt || minRtt,
      synced: this.isSynced,
      accuracy: Math.max(1, Math.round(minRtt / 2)),
      samplesCount: this.samples.length,
    };
  }

  public getServerNow(): number {
    return Date.now() + this.currentOffset;
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('ClockSync listener error:', err);
      }
    });
  }

  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.listeners.clear();
  }
}

export const clockSync = new ClockSyncService();
