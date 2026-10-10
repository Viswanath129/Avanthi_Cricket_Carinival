import React, { useState, useEffect, useMemo, useRef } from 'react';
import { doc, collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { ref as rtdbRef, onValue } from 'firebase/database';
import { httpsCallable } from 'firebase/functions';
import { db, functions, rtdb } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { calculateMaxBid, calculateBidIncrement, calculateNextBid } from '@shared/engine/bidEngine';
import { checkBucketEligibility } from '@shared/engine/bucketEligibility';
import { BucketId, DEFAULT_SQUAD_RULES, MANDATORY_BUCKETS, BUCKET_LABELS } from '@shared/types';
import SoldConfirmationModal, { type SoldPlayerDetails } from '@/components/SoldConfirmationModal';
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
  const [franchiseName, setFranchiseName] = useState<string>('Franchise');

  // Realtime Connection & Server Clock Offset
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [serverOffset, setServerOffset] = useState<number>(0);

  // Authoritative Auction State
  const [auctionState, setAuctionState] = useState<any>(null);

  // Live Auction Lot State
  const [lot, setLot] = useState<any>(null);

  // Own Franchise State
  const [ownFranchise, setOwnFranchise] = useState<any>({
    purseRemaining: 2500,
    auctionPurchases: 0,
    bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0, M6: 0 } as Record<BucketId, number>,
    isPassed: false,
  });

  const [bidHistory, setBidHistory] = useState<BidEntry[]>([]);

  // Teams live status list (all 11 teams)
  const [allTeamsStatus, setAllTeamsStatus] = useState<Array<{ id: string; name: string; status: 'IN_PLAY' | 'PASSED' | 'BLOCKED'; reason?: string }>>([]);

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showReconnectBanner, setShowReconnectBanner] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Sold modal state
  const [soldModalOpen, setSoldModalOpen] = useState(false);
  const [soldModalData, setSoldModalData] = useState<SoldPlayerDetails | null>(null);
  const lastAnimatedSaleIdRef = useRef<string | null>(null);

  // 1. RTDB presence & server time offset
  useEffect(() => {
    let unsubConn = () => {};
    let unsubOffset = () => {};
    try {
      const connectedRef = rtdbRef(rtdb, '.info/connected');
      const offsetRef = rtdbRef(rtdb, '.info/serverTimeOffset');
      unsubConn = onValue(connectedRef, (snap) => setIsOnline(snap.val() === true));
      unsubOffset = onValue(offsetRef, (snap) => setServerOffset(snap.val() || 0));
    } catch (err) {
      console.warn('RTDB sync fallback:', err);
    }
    return () => {
      unsubConn();
      unsubOffset();
    };
  }, []);

  // 2. Initialize franchise session from userDoc
  useEffect(() => {
    if (userDoc?.franchiseId) {
      const fId = String(userDoc.franchiseId);
      setFranchiseId(fId);

      const fRef = doc(db, 'franchises', fId);
      const unsub = onSnapshot(fRef, (snap) => {
        if (snap.exists()) {
          const fData = snap.data();
          setFranchiseName(fData.name || `Franchise ${fId}`);
          setOwnFranchise((prev: any) => ({
            ...prev,
            purseRemaining: fData.purseRemaining ?? prev.purseRemaining,
            auctionPurchases: fData.squad?.auctionPurchases ?? prev.auctionPurchases,
            bucketCounts: fData.squad?.bucketCounts ?? prev.bucketCounts,
          }));
        }
      }, (err) => {
        console.warn('Franchise doc listen fallback:', err);
      });
      return () => unsub();
    }
  }, [userDoc]);

  // 3. Listen to authoritative auction state
  useEffect(() => {
    const stateUnsub = onSnapshot(doc(db, 'editions', EDITION_ID, 'auction', 'state'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAuctionState(data);

        // Detect sold or unsold completion animation
        if (data.lastSale && data.lastSale.lotId) {
          const sale = data.lastSale;
          const saleAgeMs = Date.now() - (sale.timestamp || 0);
          if (lastAnimatedSaleIdRef.current !== sale.lotId && saleAgeMs < 15000) {
            lastAnimatedSaleIdRef.current = sale.lotId;
            setSoldModalData({ ...sale, outcome: 'SOLD' });
            setSoldModalOpen(true);
          }
        } else if (data.lastUnsold && data.lastUnsold.lotId) {
          const unsold = data.lastUnsold;
          const unsoldAgeMs = Date.now() - (unsold.timestamp || 0);
          if (lastAnimatedSaleIdRef.current !== unsold.lotId && unsoldAgeMs < 15000) {
            lastAnimatedSaleIdRef.current = unsold.lotId;
            setSoldModalData({ ...unsold, outcome: 'UNSOLD' });
            setSoldModalOpen(true);
          }
        }

        // Sync pass status
        if (data.franchiseStatuses && franchiseId) {
          const myStatus = data.franchiseStatuses[franchiseId];
          setOwnFranchise((prev: any) => ({
            ...prev,
            isPassed: myStatus === 'PASSED',
          }));
        }
      }
    });

    // Listen to all franchises in edition to maintain live 11 teams arena status
    const allFranchisesQ = query(collection(db, 'franchises'), where('editionId', '==', EDITION_ID));
    const allFranchisesUnsub = onSnapshot(allFranchisesQ, (snap) => {
      if (!snap.empty) {
        setAllTeamsStatus(snap.docs.map((d) => {
          const fData = d.data();
          const liveStatus = auctionState?.franchiseStatuses?.[d.id] || (fData.isPassed ? 'PASSED' : 'IN_PLAY');
          return {
            id: d.id,
            name: fData.name || `Franchise ${d.id}`,
            status: liveStatus,
          };
        }));
      }
    });

    return () => {
      stateUnsub();
      allFranchisesUnsub();
    };
  }, [franchiseId, auctionState?.franchiseStatuses]);

  // 4. Listen to current lot & bids
  useEffect(() => {
    if (!auctionState?.currentLotId) {
      setLot(null);
      setBidHistory([]);
      return;
    }

    const lotUnsub = onSnapshot(doc(db, 'lots', auctionState.currentLotId), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setLot({
          id: snap.id,
          lotNumber: d.lotNumber || d.drawNumber || 1,
          playerId: d.playerId,
          playerName: d.playerName || 'Player',
          rollNumber: d.rollNumber || '',
          bucket: (d.bucket || d.bucketId || 'B1') as BucketId,
          basePrice: d.basePrice || 20,
          currentBid: d.currentPrice || d.basePrice || 20,
          leadingFranchiseId: d.highestBidderFranchiseId || d.highestBidderId || null,
          leadingFranchiseName: d.highestBidderName || null,
          status: d.status || 'LIVE',
          timerDeadline: d.timerDeadline || null,
          timerRunning: d.timerRunning !== false,
          pausedRemainingMs: d.pausedRemainingMs ?? null,
          photoUrl: d.photoUrl || d.playerPhoto || null,
        });
      } else {
        setLot(null);
      }
    });

    const bidsQ = query(
      collection(db, 'bids'),
      where('lotId', '==', auctionState.currentLotId),
      orderBy('timestamp', 'desc'),
      limit(15)
    );
    const bidsUnsub = onSnapshot(bidsQ, (snap) => {
      setBidHistory(
        snap.docs.map((docSnap) => {
          const b = docSnap.data();
          return {
            franchiseId: b.franchiseId,
            franchiseName: b.franchiseName || 'Franchise',
            amount: b.amount,
            timestamp: b.timestamp || (b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now()),
          };
        })
      );
    });

    return () => {
      lotUnsub();
      bidsUnsub();
    };
  }, [auctionState?.currentLotId]);

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

  // 5. Authoritative countdown timer
  useEffect(() => {
    const isBidding = lot && (
      lot.status === 'LIVE' || 
      lot.status === 'BIDDING' || 
      lot.status === 'AVAILABLE' ||
      auctionState?.status === 'LIVE' || 
      auctionState?.status === 'BIDDING'
    );

    if (!isBidding) {
      setTimeLeft(0);
      return;
    }

    if (auctionState?.status === 'PAUSED' || lot?.timerRunning === false) {
      const pausedMs = typeof lot?.pausedRemainingMs === 'number'
        ? lot.pausedRemainingMs
        : (typeof auctionState?.pausedRemainingMs === 'number' ? auctionState.pausedRemainingMs : 0);
      setTimeLeft(Math.max(0, Math.ceil(pausedMs / 1000)));
      return;
    }

    const deadlineRaw = lot?.timerDeadline || auctionState?.timerDeadline;
    const deadlineMs = deadlineRaw
      ? (deadlineRaw.toMillis
        ? deadlineRaw.toMillis()
        : (typeof deadlineRaw.seconds === 'number'
          ? deadlineRaw.seconds * 1000
          : Number(deadlineRaw)))
      : null;

    if (!deadlineMs) {
      setTimeLeft(0);
      return;
    }

    const calcRemaining = () => {
      const serverNow = Date.now() + serverOffset;
      const rem = Math.max(0, Math.ceil((deadlineMs - serverNow) / 1000));
      setTimeLeft(rem);
      return rem;
    };

    const initial = calcRemaining();
    if (initial <= 0) return;

    const interval = setInterval(() => {
      const rem = calcRemaining();
      if (rem <= 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [
    lot?.id,
    lot?.status,
    lot?.timerRunning,
    lot?.pausedRemainingMs,
    lot?.timerDeadline?.seconds || lot?.timerDeadline,
    auctionState?.status,
    auctionState?.auctionSessionId,
    auctionState?.pausedRemainingMs,
    auctionState?.timerDeadline?.seconds || auctionState?.timerDeadline,
    serverOffset,
  ]);

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
      currentPlayerBucket: (lot?.bucket || 'B1') as BucketId,
      minAuctionPurchases: DEFAULT_SQUAD_RULES.minAuctionPurchases, // 15
      bucketMinimums: DEFAULT_SQUAD_RULES.bucketMinimums,
    });
  }, [ownFranchise, lot?.bucket]);

  const bucketEligibility = useMemo(() => {
    return checkBucketEligibility({
      purseRemaining: ownFranchise.purseRemaining,
      auctionPurchasesSoFar: ownFranchise.auctionPurchases,
      bucketCounts: ownFranchise.bucketCounts,
      currentPlayerBucket: (lot?.bucket || 'B1') as BucketId,
      currentPrice: nextBid,
      minAuctionPurchases: DEFAULT_SQUAD_RULES.minAuctionPurchases,
      bucketMinimums: DEFAULT_SQUAD_RULES.bucketMinimums,
    });
  }, [ownFranchise, lot?.bucket, nextBid]);

  // Determine if bidding is legally blocked
  const isSquadCapped = ownFranchise.auctionPurchases >= 15;
  const isLeading = lot?.leadingFranchiseId === franchiseId;
  const isTimerExpired = timeLeft <= 0;
  const isPaused = auctionState?.status === 'PAUSED' || lot?.status === 'PAUSED';

  let blockedReason: string | null = null;
  if (!lot) blockedReason = 'AWAITING_NEXT_LOT';
  else if (lot.status !== 'LIVE') blockedReason = `LOT_${lot.status}`;
  else if (isPaused) blockedReason = 'AUCTION_PAUSED';
  else if (isTimerExpired) blockedReason = 'TIMER_EXPIRED';
  else if (isLeading) blockedReason = 'CURRENTLY_LEADING';
  else if (isSquadCapped) blockedReason = 'SQUAD_CAP';
  else if (!maxBidCalculation.isEligible) blockedReason = 'SLOT_PROTECTION';
  else if (nextBid > maxBidCalculation.maxBid) blockedReason = 'MAX_BID_EXCEEDED';
  else if (!bucketEligibility.eligible) blockedReason = 'SLOT_PROTECTION';
  else if (ownFranchise.purseRemaining < nextBid) blockedReason = 'NO_PURSE';

  const canBid = !blockedReason && isOnline && !isSubmitting && Boolean(lot?.id);

  // Handle Bid - Routes through Cloud Function
  const handleBid = async () => {
    if (!canBid || !lot?.id) return;

    if (navigator.vibrate) navigator.vibrate(40);
    setIsSubmitting(true);
    setActionError(null);

    const clientActionId = nanoid();

    try {
      const placeBidFn = httpsCallable(functions, 'placeBid');
      await placeBidFn({
        editionId: EDITION_ID,
        lotId: lot.id,
        auctionSessionId: auctionState?.auctionSessionId,
        franchiseId,
        clientActionId,
      });
    } catch (err: any) {
      console.error('[FranchiseBidding] Place bid failed:', err);
      setActionError(err.message || 'Bid rejected by server. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Pass - Routes through passFranchise Cloud Function
  const handleTogglePass = async () => {
    if (!lot?.id) return;
    if (isLeading) {
      setActionError('Cannot pass while currently holding the leading bid.');
      return;
    }

    const nextPassed = !ownFranchise.isPassed;
    setActionError(null);

    try {
      const passFranchiseFn = httpsCallable(functions, 'passFranchise');
      await passFranchiseFn({
        editionId: EDITION_ID,
        lotId: lot.id,
        franchiseId,
        action: nextPassed ? 'PASS' : 'UNPASS',
      });
    } catch (err: any) {
      console.error('[FranchiseBidding] Pass toggle failed:', err);
      setActionError(err.message || 'Failed to update pass status.');
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
            {lot ? (
              <>
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
                        {lot.playerName?.charAt(0) || 'P'}
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
              </>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-2xl font-mono">
                  ⏱️
                </div>
                <h3 className="font-serif font-bold text-slate-800 dark:text-slate-200 text-base">
                  Awaiting Next Lot
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Auctioneer is preparing the next player. This view will update automatically.
                </p>
              </div>
            )}
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
                {lot?.leadingFranchiseName || 'No Bids Placed'} {isLeading && '(YOU)'}
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

      <SoldConfirmationModal
        isOpen={soldModalOpen}
        onClose={() => setSoldModalOpen(false)}
        soldData={soldModalData}
      />
    </div>
  );
}
