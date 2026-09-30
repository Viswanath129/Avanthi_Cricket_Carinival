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
  totalDurationMs: number = 20000
): AuctionTimerState {
  const deadlineMs = rawDeadline?.toMillis
    ? rawDeadline.toMillis()
    : typeof rawDeadline === 'number'
    ? rawDeadline
    : Number(rawDeadline) || 0;

  const [remainingSec, setRemainingSec] = useState<number>(() => {
    if (!deadlineMs || isPaused) return 0;
    const now = clockSync.getServerNow();
    return Math.max(0, Math.ceil((deadlineMs - now) / 1000));
  });

  const [remainingMs, setRemainingMs] = useState<number>(0);
  const lastRemainingSecRef = useRef<number>(remainingSec);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!deadlineMs || isPaused || phase === 'PAUSED') {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      return;
    }

    const tick = () => {
      const now = clockSync.getServerNow();
      const diffMs = Math.max(0, deadlineMs - now);
      const nextSec = Math.max(0, Math.ceil(diffMs / 1000));

      // Guard: prevent backward jump flicker during normal countdown
      const prev = lastRemainingSecRef.current;
      if (prev > 0 && nextSec > prev && nextSec - prev > 1 && nextSec < 19) {
        // Keep current until confirmed
      } else {
        lastRemainingSecRef.current = nextSec;
        setRemainingSec(nextSec);
      }

      setRemainingMs(diffMs);

      if (diffMs > 0 && !isPaused) {
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
  }, [deadlineMs, isPaused, phase]);

  // Color mapping based on exact Part 10 rules
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
