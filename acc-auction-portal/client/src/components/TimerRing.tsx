import React from 'react';
import { useAuctionTimer } from '@/hooks/useAuctionTimer';

interface TimerRingProps {
  deadline: any;
  isPaused?: boolean;
  phase?: string;
  totalDurationMs?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showMicroLabel?: boolean;
}

export const TimerRing: React.FC<TimerRingProps> = ({
  deadline,
  isPaused = false,
  phase = 'OPEN',
  totalDurationMs = 20000,
  size = 110,
  strokeWidth = 7,
  className = '',
  showMicroLabel = true,
}) => {
  const { remainingSec, formattedTime, ringProgress, ringColor, isExpired } = useAuctionTimer(
    deadline,
    isPaused,
    phase,
    totalDurationMs
  );

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - ringProgress);

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      role="timer"
      aria-live="polite"
      aria-label={`Auction clock: ${remainingSec} seconds remaining`}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 origin-center overflow-visible"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-200 dark:text-slate-800"
        />

        {/* Dynamic progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-colors duration-200 ease-out"
          style={{
            filter: remainingSec > 0 && remainingSec <= 5 ? `drop-shadow(0 0 6px ${ringColor})` : 'none',
          }}
        />
      </svg>

      {/* Center Countdown Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span
          className="font-mono font-black tracking-tight tabular-nums transition-colors"
          style={{
            fontSize: size >= 120 ? '1.75rem' : size >= 90 ? '1.35rem' : '1.1rem',
            color: ringColor,
            lineHeight: 1,
          }}
        >
          {remainingSec}s
        </span>
        {showMicroLabel && (
          <span
            className="text-[9px] uppercase tracking-wider font-bold mt-1"
            style={{ color: isPaused ? '#F59E0B' : isExpired ? '#6B7280' : 'var(--text-muted, #64748B)' }}
          >
            {isPaused ? 'PAUSED' : isExpired ? 'TIME UP' : 'CLOCK'}
          </span>
        )}
      </div>
    </div>
  );
};

export default TimerRing;
