import React, { useEffect } from 'react';
import { TeamEmblemBadge } from '@/pages/LiveAuctionPage';
import { BUCKET_LABELS, type BucketId } from '@shared/types';

export interface SoldPlayerDetails {
  lotId?: string;
  drawNumber?: number | string;
  lotNumber?: string;
  playerName: string;
  rollNumber?: string;
  department?: string;
  branch?: string;
  year?: number | string;
  bucket?: string;
  playerType?: string;
  photoUrl?: string | null;
  franchiseId?: string | number;
  franchiseName: string;
  soldPrice: number;
}

export interface SoldConfirmationModalProps {
  soldData: SoldPlayerDetails | null;
  isOpen: boolean;
  onClose: () => void;
  autoCloseDurationMs?: number;
}

export default function SoldConfirmationModal({
  soldData,
  isOpen,
  onClose,
  autoCloseDurationMs = 2800,
}: SoldConfirmationModalProps) {
  useEffect(() => {
    if (!isOpen || !soldData) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDurationMs);

    return () => clearTimeout(timer);
  }, [isOpen, soldData, onClose, autoCloseDurationMs]);

  if (!isOpen || !soldData) return null;

  const initials = (soldData.playerName || 'P')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const bucketLabel = soldData.bucket
    ? BUCKET_LABELS[soldData.bucket as BucketId] || soldData.bucket
    : '';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sold Confirmation"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-white border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative radial glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-500/30 text-emerald-700 text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Hammer Sale Confirmed
        </div>

        {/* Player Photo / Default Avatar */}
        <div className="relative mx-auto my-3 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          {soldData.photoUrl && soldData.photoUrl.trim() !== '' && !soldData.photoUrl.includes('acc-logo.png') ? (
            <img
              src={soldData.photoUrl}
              alt={soldData.playerName}
              className="w-full h-full object-cover rounded-full border-4 border-emerald-500 shadow-xl shadow-emerald-500/20"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 border-4 border-emerald-500 flex items-center justify-center text-emerald-700 font-display font-extrabold text-3xl sm:text-4xl shadow-xl shadow-emerald-500/20">
              {initials}
            </div>
          )}

          {/* Gavel icon overlay */}
          <div className="absolute -bottom-2 -right-1 w-10 h-10 rounded-full bg-white border-2 border-emerald-500 shadow-md flex items-center justify-center overflow-hidden">
            <img
              src="/auction-hammer.svg"
              alt="Gavel"
              className="w-7 h-7 object-contain"
              onError={(e) => {
                // If svg fails to load, show unicode gavel
                (e.currentTarget as HTMLElement).style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.innerText = '🔨';
                }
              }}
            />
          </div>
        </div>

        {/* SOLD Indicator */}
        <div className="text-3xl sm:text-4xl font-display font-black text-emerald-600 tracking-tight leading-none mt-2">
          SOLD!
        </div>

        {/* Player Name & Identifier */}
        <div className="mt-2 space-y-1">
          <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 uppercase tracking-tight">
            {soldData.playerName}
          </h2>
          <p className="text-xs font-mono text-slate-500">
            {soldData.rollNumber ? `${soldData.rollNumber} · ` : ''}
            {soldData.branch || soldData.department || ''}
            {soldData.year ? ` · Year ${soldData.year}` : ''}
            {soldData.bucket ? ` · ${soldData.bucket}` : ''}
          </p>
          {bucketLabel && (
            <span className="inline-block text-[11px] font-mono text-emerald-600 font-semibold">
              {bucketLabel}
            </span>
          )}
        </div>

        {/* Winning Franchise & Price Card */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-left min-w-0">
            <TeamEmblemBadge
              franchiseId={soldData.franchiseId || '1'}
              name={soldData.franchiseName}
              size={36}
            />
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Acquired By
              </span>
              <span className="font-display font-bold text-sm sm:text-base text-slate-900 truncate block">
                {soldData.franchiseName}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Final Price
            </span>
            <span className="font-mono font-black text-lg sm:text-xl text-emerald-600">
              {soldData.soldPrice}{' '}
              <span className="text-xs font-bold text-slate-500">Credits</span>
            </span>
          </div>
        </div>

        {/* Dismiss prompt button */}
        <div className="mt-4">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-mono transition-colors"
          >
            CONTINUE AUCTION &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
