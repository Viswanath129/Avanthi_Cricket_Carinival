import React, { useState, useEffect, useMemo, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { calculateMaxBid, calculateBidIncrement, calculateNextBid } from '@shared/engine/bidEngine';
import { checkBucketEligibility } from '@shared/engine/bucketEligibility';
import { BucketId, DEFAULT_SQUAD_RULES, MANDATORY_BUCKETS, BUCKET_LABELS } from '@shared/types';
import { useServerTime } from '@/hooks/useServerTime';
import { nanoid } from 'nanoid';

const EDITION_ID = 'acc-2026';

interface BidEntry {
  franchiseId: string;
  franchiseName: string;
  amount: number;
  timestamp: number;
}

export default function FranchiseBiddingPage() {
  const { user, userDoc } = useAuth();

  // Active Franchise state
  const [franchiseId, setFranchiseId] = useState<string>('1');
  const [franchiseName, setFranchiseName] = useState<string>('CSE Champions');

  // Live Auction State
  const [lot, setLot] = useState<any>({
    lotNumber: 1,
    playerId: 'p101',
    playerName: 'S. Sai Teja',
    rollNumber: '25811A0403',
    bucket: 'B2' as BucketId,
    basePrice: 20,
    currentBid: 40,
    leadingFranchiseId: '2',
    leadingFranchiseName: 'ECE Electro Kings',
    status: 'IN_PLAY', // 'IN_PLAY' | 'PAUSED' | 'HAMMERED'
    timerDeadline: Date.now() + 20000,
    photoUrl: null,
  });

  const [ownFranchise, setOwnFranchise] = useState<any>({
    purseRemaining: 880,
    auctionPurchases: 3,
    bucketCounts: { B1: 1, B2: 0, B3: 1, B4: 1, D5: 0, M6: 0 } as Record<BucketId, number>,
    isPassed: false,
  });

  const [bidHistory, setBidHistory] = useState<BidEntry[]>([
    { franchiseId: '1', franchiseName: 'CSE Champions', amount: 20, timestamp: Date.now() - 14000 },
    { franchiseId: '3', franchiseName: 'Mechanical Warriors', amount: 30, timestamp: Date.now() - 9000 },
    { franchiseId: '2', franchiseName: 'ECE Electro Kings', amount: 40, timestamp: Date.now() - 3000 },
  ]);

  // Teams live status list
  const [allTeamsStatus, setAllTeamsStatus] = useState<Array<{ id: string; name: string; status: 'IN_PLAY' | 'PASSED' | 'BLOCKED'; reason?: string }>>([
    { id: '1', name: 'CSE Champions', status: 'IN_PLAY' },
    { id: '2', name: 'ECE Electro Kings', status: 'IN_PLAY' },
    { id: '3', name: 'Mechanical Warriors', status: 'IN_PLAY' },
    { id: '4', name: 'Civil Gladiators', status: 'PASSED' },
    { id: '5', name: 'EEE Spark Royals', status: 'BLOCKED', reason: 'MAX_BID_EXCEEDED' },
    { id: '6', name: 'CSM Cyber Knights', status: 'IN_PLAY' },
    { id: '7', name: 'CSD Data Strikers', status: 'IN_PLAY' },
    { id: '8', name: 'Diploma Dynamic Titans', status: 'IN_PLAY' },
    { id: '9', name: 'Pharmacy Phoenix', status: 'PASSED' },
    { id: '10', name: 'MBA Mavericks', status: 'IN_PLAY' },
    { id: '11', name: 'Staff Super Kings', status: 'IN_PLAY' },
  ]);

  const { isOnline, computeRemainingSeconds } = useServerTime();
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [showReconnectBanner, setShowReconnectBanner] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Initialize franchise session from Auth or LocalStorage
  useEffect(() => {
    if (userDoc?.franchiseId) {
      setFranchiseId(String(userDoc.franchiseId));
    } else {
      try {
        const stored = localStorage.getItem('acc_active_franchise_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.franchiseId) setFranchiseId(String(parsed.franchiseId));
          if (parsed.franchiseName) setFranchiseName(parsed.franchiseName);
        }
      } catch {
        // ignore
      }
    }
  }, [userDoc]);

  // Network connection monitor & reconnect banner
  const prevOnlineRef = useRef<boolean>(isOnline);
  useEffect(() => {
    if (!prevOnlineRef.current && isOnline) {
      setShowReconnectBanner(true);
      const timer = setTimeout(() => setShowReconnectBanner(false), 5000);
      return () => clearTimeout(timer);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  // Authoritative server timer loop
  useEffect(() => {
    if (lot?.status === 'PAUSED') return;
    const remaining = computeRemainingSeconds(lot?.timerDeadline, lot?.status === 'PAUSED');
    setTimeLeft(remaining);
  }, [lot, computeRemainingSeconds]);

  // Calculate Next Legal Bid
  const currentBid = lot?.currentBid || lot?.basePrice || 20;
  const increment = calculateBidIncrement(currentBid);
  const nextBid = calculateNextBid(currentBid);

  // Calculate Max Permissible Bid (§12.1) & Slot Protection (§12.2)
  const maxBidCalculation = useMemo(() => {
    return calculateMaxBid({
      purseRemaining: ownFranchise.purseRemaining,
      auctionPurchasesSoFar: ownFranchise.auctionPurchases,
      bucketCounts: ownFranchise.bucketCounts,
      currentPlayerBucket: lot.bucket,
      minAuctionPurchases: DEFAULT_SQUAD_RULES.minAuctionPurchases, // 15
      bucketMinimums: DEFAULT_SQUAD_RULES.bucketMinimums,
    });
  }, [ownFranchise, lot.bucket]);

  const bucketEligibility = useMemo(() => {
    return checkBucketEligibility({
      purseRemaining: ownFranchise.purseRemaining,
      auctionPurchasesSoFar: ownFranchise.auctionPurchases,
      bucketCounts: ownFranchise.bucketCounts,
      currentPlayerBucket: lot.bucket,
      currentPrice: nextBid,
      minAuctionPurchases: DEFAULT_SQUAD_RULES.minAuctionPurchases,
      bucketMinimums: DEFAULT_SQUAD_RULES.bucketMinimums,
    });
  }, [ownFranchise, lot.bucket, nextBid]);

  // Determine if bidding is legally blocked
  const isSquadCapped = ownFranchise.auctionPurchases >= 15;
  const isLeading = lot?.leadingFranchiseId === franchiseId;
  const isTimerExpired = timeLeft <= 0;
  const isPaused = lot?.status === 'PAUSED';

  let blockedReason: string | null = null;
  if (isPaused) blockedReason = 'AUCTION_PAUSED';
  else if (isTimerExpired) blockedReason = 'TIMER_EXPIRED';
  else if (isLeading) blockedReason = 'CURRENTLY_LEADING';
  else if (isSquadCapped) blockedReason = 'SQUAD_CAP';
  else if (!maxBidCalculation.isEligible) blockedReason = 'SLOT_PROTECTION';
  else if (nextBid > maxBidCalculation.maxBid) blockedReason = 'MAX_BID_EXCEEDED';
  else if (!bucketEligibility.eligible) blockedReason = 'SLOT_PROTECTION';
  else if (ownFranchise.purseRemaining < nextBid) blockedReason = 'NO_PURSE';

  const canBid = !blockedReason && isOnline && !isSubmitting;

  // Handle Bid
  const handleBid = async () => {
    if (!canBid) return;

    if (navigator.vibrate) navigator.vibrate(40);
    setIsSubmitting(true);
    setActionError(null);

    const clientActionId = nanoid();

    try {
      // Call Firebase function if connected
      const placeBidFn = httpsCallable(functions, 'placeBid');
      await placeBidFn({
        editionId: EDITION_ID,
        franchiseId,
        playerId: lot.playerId,
        bidAmount: nextBid,
        clientActionId,
      });
    } catch (err) {
      // Fallback local simulated update:
      setLot((prev: any) => ({
        ...prev,
        currentBid: nextBid,
        leadingFranchiseId: franchiseId,
        leadingFranchiseName: franchiseName,
        timerDeadline: Date.now() + 20000, // Reset to full 20s
      }));

      setBidHistory((prev) => [
        {
          franchiseId,
          franchiseName,
          amount: nextBid,
          timestamp: Date.now(),
        },
        ...prev,
      ]);

      // Re-enter play if previously passed
      if (ownFranchise.isPassed) {
        setOwnFranchise((f: any) => ({ ...f, isPassed: false }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Pass
  const handleTogglePass = async () => {
    if (isLeading) {
      setActionError('Cannot pass while currently holding the leading bid.');
      return;
    }

    const nextPassed = !ownFranchise.isPassed;
    setOwnFranchise((f: any) => ({ ...f, isPassed: nextPassed }));

    try {
      const passFn = httpsCallable(functions, nextPassed ? 'passLot' : 'reenterLot');
      await passFn({ editionId: EDITION_ID, franchiseId, lotNumber: lot.lotNumber });
    } catch {
      // local state already toggled
    }
  };

  // Timer ring color styling
  const timerColor = timeLeft > 10 ? 'text-emerald-500' : timeLeft > 5 ? 'text-amber-500' : 'text-red-500 animate-pulse';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors pb-12">
      {/* Reconnect Banner (Section 3.8) */}
      {showReconnectBanner && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <span>\u2713</span>
          <span>
            Connected to live auction stream! Current Bid: <strong>{currentBid}c</strong> (Leader: {lot.leadingFranchiseName})
          </span>
        </div>
      )}

      {/* HEADER (Section 3.2) */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-serif font-bold text-emerald-500 text-base shadow-sm">
              F{franchiseId}
            </div>
            <div>
              <h1 className="font-serif font-bold text-sm md:text-base text-slate-900 dark:text-slate-100 leading-tight">
                {franchiseName}
              </h1>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {ownFranchise.purseRemaining} Credits
                </span>
                <span className="text-slate-400">\u00B7</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {15 - ownFranchise.auctionPurchases} Slots Left (Max Bid: {maxBidCalculation.maxBid}c)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'
              }`}
            />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">
              {isOnline ? 'LIVE SYNC' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {actionError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs font-semibold text-red-600 dark:text-red-400">
            \u26A0 {actionError}
          </div>
        )}

        {/* CORE LOT & BIDDING SECTION (Above The Fold) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* CURRENT LOT PANEL (Section 3.3) */}
          <div className="md:col-span-5 backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                LOT #{lot.lotNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                Bucket {lot.bucket}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center font-bold text-slate-400 overflow-hidden shadow-md">
                {lot.photoUrl ? (
                  <img src={lot.photoUrl} alt={lot.playerName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-serif text-emerald-500">
                    {lot.playerName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-serif font-bold text-lg md:text-xl text-slate-900 dark:text-slate-100 leading-snug">
                  {lot.playerName}
                </h2>
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{lot.rollNumber}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Base Price:</span>
                  <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    {lot.basePrice} Credits
                  </span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex justify-between font-mono">
              <span>Category:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {BUCKET_LABELS[lot.bucket as BucketId] || lot.bucket}
              </span>
            </div>
          </div>

          {/* LIVE BIDDING PANEL (Section 3.4) */}
          <div className="md:col-span-7 backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                LIVE AUCTION STATE
              </span>
              {/* Timer Ring / Countdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-slate-500">Timer:</span>
                <span className={`font-mono text-lg font-bold ${timerColor}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            <div className="text-center py-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">
                CURRENT AUTHORITY BID
              </span>
              <div className="font-mono font-black text-5xl md:text-6xl text-slate-900 dark:text-slate-100 tracking-tight">
                {currentBid} <span className="text-2xl font-normal text-slate-400">Credits</span>
              </div>
            </div>

            {/* Leading Franchise Badge */}
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-800 dark:text-emerald-300 font-bold uppercase">
                Leading Franchise
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {lot.leadingFranchiseName} {isLeading && '(YOU)'}
              </span>
            </div>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTONS (Section 3.5) */}
        <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl p-5 shadow-lg space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* BIG BID BUTTON */}
            <button
              type="button"
              onClick={handleBid}
              disabled={!canBid}
              className={`sm:col-span-2 min-h-[58px] py-4 px-6 rounded-2xl font-mono font-black text-lg md:text-xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
                canBid
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                'TRANSMITTING BID...'
              ) : (
                <>
                  <span>BID +{increment}c</span>
                  <span className="text-sm font-normal opacity-80">({nextBid} Credits)</span>
                </>
              )}
            </button>

            {/* PASS / RE-ENTER TOGGLE BUTTON */}
            <button
              type="button"
              onClick={handleTogglePass}
              className={`min-h-[58px] py-4 px-4 rounded-2xl font-bold text-sm md:text-base border transition-all active:scale-95 flex items-center justify-center ${
                ownFranchise.isPassed
                  ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {ownFranchise.isPassed ? '[ RE-ENTER LOT ]' : '[ PASS LOT ]'}
            </button>
          </div>

          {/* Inline Blocked Reason Tag (Section 3.5) */}
          {blockedReason && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-center text-xs font-mono font-bold text-red-600 dark:text-red-400">
              \u26A0 BIDDING BLOCKED: {blockedReason}
            </div>
          )}
        </div>

        {/* OWN STATUS PANEL (Section 3.6) */}
        <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Own Franchise Status & Mandatory Bucket Quotas
            </h3>
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Purchases: {ownFranchise.auctionPurchases} / 15
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono">
            {MANDATORY_BUCKETS.map((b) => {
              const count = ownFranchise.bucketCounts[b] || 0;
              const isMet = count >= 1;
              return (
                <div
                  key={b}
                  className={`p-3 rounded-2xl border text-xs ${
                    isMet
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                      : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                  }`}
                >
                  <span className="font-bold block">{b}</span>
                  <span className="text-base font-extrabold">{count}</span>
                  <span className="text-[10px] block opacity-80">{isMet ? 'Quota Met' : 'Unmet (Need 1)'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* LIVE LISTS: IN-PLAY, PASSED, BLOCKED & BID HISTORY (Section 3.7) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bid Stream Order */}
          <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl p-5 shadow-lg space-y-3">
            <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
              Bid Sequence Order (Live)
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {bidHistory.map((b, idx) => (
                <div
                  key={b.timestamp + idx}
                  className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 font-mono"
                >
                  <span className="font-bold text-slate-900 dark:text-slate-100">{b.franchiseName}</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">{b.amount} Credits</span>
                </div>
              ))}
            </div>
          </div>

          {/* 11 Teams Status Matrix */}
          <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl p-5 shadow-lg space-y-3">
            <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
              Franchise Arena States (11 Teams)
            </h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {allTeamsStatus.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-xs p-1.5 rounded-lg">
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                    {t.name}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      t.status === 'IN_PLAY'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                        : t.status === 'PASSED'
                        ? 'bg-slate-200 text-slate-600 border-slate-300'
                        : 'bg-red-500/10 text-red-600 border-red-500/30'
                    }`}
                  >
                    {t.status} {t.reason ? `(${t.reason})` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
