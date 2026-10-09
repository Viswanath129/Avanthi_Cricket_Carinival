import { useState, useEffect, useRef } from 'react';
import { clockSync } from '@/services/clockSync';

export interface AuctionTimerState {
  remainingMs: number;
  remainingSec: number;
  formattedTime: string;
  ringProgress: number; // 0.0 to 1.0
  ringColor: string;
  isPaused: boolean;
  isExpired: boolean;
  phase: string;
  deadlineMs: number;
}

export function useAuctionTimer(
  rawDeadline: any,
  isPaused: boolean = false,
  phase: string = 'OPEN',
  totalDurationMs: number = 30000,
  pausedRemainingMs?: number | null
): AuctionTimerState {
  const deadlineMs = rawDeadline?.toMillis
    ? rawDeadline.toMillis()
    : typeof rawDeadline === 'number'
    ? rawDeadline
    : Number(rawDeadline) || 0;

  const [remainingSec, setRemainingSec] = useState<number>(() => {
    if (isPaused || phase === 'PAUSED') {
      if (typeof pausedRemainingMs === 'number') {
        return Math.max(0, Math.ceil(pausedRemainingMs / 1000));
      }
      return 30;
    }
    if (!deadlineMs) return 0;
    const now = clockSync.getServerNow();
    return Math.max(0, Math.ceil((deadlineMs - now) / 1000));
  });

  const [remainingMs, setRemainingMs] = useState<number>(() => {
    if (isPaused || phase === 'PAUSED') {
      if (typeof pausedRemainingMs === 'number') {
        return Math.max(0, pausedRemainingMs);
      }
      return 30000;
    }
    if (!deadlineMs) return 0;
    const now = clockSync.getServerNow();
    return Math.max(0, deadlineMs - now);
  });

  const lastRemainingSecRef = useRef<number>(remainingSec);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // If paused, freeze the timer and preserve remaining time
    if (isPaused || phase === 'PAUSED') {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      const frozenMs = typeof pausedRemainingMs === 'number'
        ? Math.max(0, pausedRemainingMs)
        : (deadlineMs > 0 ? Math.max(0, deadlineMs - clockSync.getServerNow()) : 0);
      const frozenSec = Math.max(0, Math.ceil(frozenMs / 1000));
      setRemainingMs(frozenMs);
      setRemainingSec(frozenSec);
      lastRemainingSecRef.current = frozenSec;
      return;
    }

    if (!deadlineMs) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setRemainingSec(0);
      setRemainingMs(0);
      return;
    }

    const tick = () => {
      const now = clockSync.getServerNow();
      const diffMs = Math.max(0, deadlineMs - now);
      const nextSec = Math.max(0, Math.ceil(diffMs / 1000));

      lastRemainingSecRef.current = nextSec;
      setRemainingSec(nextSec);
      setRemainingMs(diffMs);

      if (diffMs > 0 && !isPaused && phase !== 'PAUSED') {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [deadlineMs, isPaused, phase, pausedRemainingMs]);

  // Color mapping
  let ringColor = '#10B981'; // Green (>10s)
  if (remainingSec === 0) {
    ringColor = '#6B7280'; // Grey (0s)
  } else if (remainingSec < 5) {
    ringColor = '#EF4444'; // Red (<5s)
  } else if (remainingSec <= 10) {
    ringColor = '#F59E0B'; // Amber (5-10s)
  }

  const effectiveTotal = Math.max(1000, totalDurationMs);
  const ringProgress = Math.min(1, Math.max(0, remainingMs / effectiveTotal));
  const formattedTime = `00:${String(remainingSec).padStart(2, '0')}`;
  const isExpired = deadlineMs > 0 && remainingSec === 0;

  return {
    remainingMs,
    remainingSec,
    formattedTime,
    ringProgress,
    ringColor,
    isPaused: isPaused || phase === 'PAUSED',
    isExpired,
    phase,
    deadlineMs,
  };
}
