import { useState, useEffect, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { clockSync, ClockSyncState } from '@/services/clockSync';

export interface ServerTimeState {
  serverNow: () => number;
  offset: number;
  rtt: number;
  synced: boolean;
  accuracy: number; // ±ms
  isOnline: boolean;
  computeRemainingSeconds: (timerDeadline: any, isPaused?: boolean) => number;
}

export function useServerTime(): ServerTimeState {
  const [syncState, setSyncState] = useState<ClockSyncState>(clockSync.getState());
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // 1. Subscribe to ClockSync service
  useEffect(() => {
    const unsubClock = clockSync.subscribe((state) => {
      setSyncState(state);
    });

    // 2. Subscribe to Firebase RTDB serverTimeOffset & connection presence
    let unsubRtdbOffset = () => {};
    let unsubRtdbConn = () => {};

    try {
      const offsetRef = ref(rtdb, '.info/serverTimeOffset');
      unsubRtdbOffset = onValue(offsetRef, (snap) => {
        const val = snap.val();
        if (typeof val === 'number') {
          clockSync.applyExternalOffset(val);
        }
      });

      const connectedRef = ref(rtdb, '.info/connected');
      unsubRtdbConn = onValue(connectedRef, (snap) => {
        setIsOnline(snap.val() === true);
      });
    } catch (err) {
      console.warn('RTDB clock sync fallback note:', err);
    }

    return () => {
      unsubClock();
      unsubRtdbOffset();
      unsubRtdbConn();
    };
  }, []);

  const serverNow = useCallback((): number => {
    return clockSync.getServerNow();
  }, []);

  const computeRemainingSeconds = useCallback(
    (timerDeadline: any, isPaused: boolean = false): number => {
      if (!timerDeadline || isPaused) return 0;

      const deadlineMs = timerDeadline?.toMillis
        ? timerDeadline.toMillis()
        : typeof timerDeadline === 'number'
        ? timerDeadline
        : Number(timerDeadline);

      if (isNaN(deadlineMs) || deadlineMs <= 0) return 0;

      const now = clockSync.getServerNow();
      const remainingMs = deadlineMs - now;
      return Math.max(0, Math.ceil(remainingMs / 1000));
    },
    []
  );

  return {
    serverNow,
    offset: syncState.offset,
    rtt: syncState.rtt,
    synced: syncState.synced,
    accuracy: syncState.accuracy,
    isOnline,
    computeRemainingSeconds,
  };
}
