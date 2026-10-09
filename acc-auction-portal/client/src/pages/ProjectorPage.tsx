import React, { useState, useEffect, useMemo, useRef } from 'react';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { ref as rtdbRef, onValue } from 'firebase/database';
import { db, rtdb } from '@/lib/firebase';
import SoldConfirmationModal, { type SoldPlayerDetails } from '@/components/SoldConfirmationModal';
import { cn } from '@/lib/utils';
import { BUCKET_LABELS, type BucketId } from '@shared/types';
import { checkScarcity } from '@shared/engine/scarcity';
import { FRANCHISE_BRAND, TeamEmblemBadge, DEFAULT_FRANCHISES } from './LiveAuctionPage';

const EDITION_ID = 'acc-2026';

export default function ProjectorPage() {
  const [auctionState, setAuctionState] = useState<any>({
    status: 'LOT_OPEN',
    currentLotId: 'lot-1'
  });
  const [currentLot, setCurrentLot] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>(DEFAULT_FRANCHISES);
  const [allLots, setAllLots] = useState<any[]>([]);
  
  // Realtime Presence & Clock Offset
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [serverOffset, setServerOffset] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sold confirmation animation state
  const [soldModalOpen, setSoldModalOpen] = useState(false);
  const [soldModalData, setSoldModalData] = useState<SoldPlayerDetails | null>(null);
  const lastAnimatedSaleIdRef = useRef<string | null>(null);

  // Fullscreen helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Realtime listeners
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

    const stateUnsub = onSnapshot(doc(db, 'editions', EDITION_ID, 'auction', 'state'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAuctionState(data);
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
      }
    });

    const franchQ = query(collection(db, 'franchises'), where('editionId', '==', EDITION_ID));
    const franchUnsub = onSnapshot(franchQ, (snap) => {
      if (!snap.empty) {
        setFranchises(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    });

    const allLotsQ = query(collection(db, 'lots'), where('editionId', '==', EDITION_ID));
    const allLotsUnsub = onSnapshot(allLotsQ, (snap) => {
      if (!snap.empty) {
        setAllLots(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    });

    return () => {
      unsubConn();
      unsubOffset();
      stateUnsub();
      franchUnsub();
      allLotsUnsub();
    };
  }, []);

  // Listen to current lot & bids
  useEffect(() => {
    if (!auctionState?.currentLotId) {
      // Default demo lot for crystal clear broadcast readiness
      setCurrentLot({
        id: 'lot-1',
        drawNumber: 1,
        lotNumber: 'B3-014',
        playerName: 'Sai Teja',
        bucket: 'B3',
        playerType: 'ALL_ROUNDER',
        program: 'B.Tech',
        branch: 'ECE',
        year: 3,
        basePrice: 50,
        status: 'AVAILABLE',
        currentPrice: 140,
        highestBidderId: '1',
        highestBidderName: 'Titans',
        timerDeadline: Date.now() + 18000
      });
      return;
    }

    const lotUnsub = onSnapshot(doc(db, 'lots', auctionState.currentLotId), (snap) => {
      if (snap.exists()) {
        setCurrentLot({ id: snap.id, ...snap.data() });
      }
    });

    const bidsQ = query(
      collection(db, 'bids'),
      where('lotId', '==', auctionState.currentLotId),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const bidsUnsub = onSnapshot(bidsQ, (snap) => {
      setBids(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      lotUnsub();
      bidsUnsub();
    };
  }, [auctionState?.currentLotId]);

  // Synchronized countdown timer (Authoritative server deadline derivation)
  useEffect(() => {
    // 1. If no lot active or lot is not live/available, timer is inactive (0)
    if (!currentLot || (currentLot.status !== 'LIVE' && currentLot.status !== 'AVAILABLE')) {
      setTimeLeft(0);
      return;
    }

    // 2. If auction is paused, derive fixed remaining seconds
    if (auctionState?.status === 'PAUSED' || currentLot.timerRunning === false) {
      const pausedMs = typeof currentLot.pausedRemainingMs === 'number'
        ? currentLot.pausedRemainingMs
        : (typeof auctionState?.pausedRemainingMs === 'number' ? auctionState.pausedRemainingMs : 0);
      setTimeLeft(Math.max(0, Math.ceil(pausedMs / 1000)));
      return;
    }

    // 3. Live countdown from authoritative deadline
    const deadlineMs = currentLot.timerDeadline
      ? (currentLot.timerDeadline.toMillis
        ? currentLot.timerDeadline.toMillis()
        : (typeof currentLot.timerDeadline.seconds === 'number'
          ? currentLot.timerDeadline.seconds * 1000
          : Number(currentLot.timerDeadline)))
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
    currentLot?.id,
    currentLot?.status,
    currentLot?.timerRunning,
    currentLot?.pausedRemainingMs,
    currentLot?.timerDeadline?.seconds || currentLot?.timerDeadline,
    auctionState?.status,
    auctionState?.pausedRemainingMs,
    serverOffset,
  ]);

  const highestBid = bids[0];
  const currentBidPrice = highestBid?.amount || currentLot?.currentPrice || currentLot?.basePrice || 50;
  const leaderName = highestBid?.franchiseName || currentLot?.highestBidderName || null;
  const leaderId = highestBid?.franchiseId || currentLot?.highestBidderId || null;

  // Scarcity evaluation
  const scarcityWarnings = useMemo(() => {
    const buckets: BucketId[] = ['B3', 'B4', 'B2', 'D5', 'B1'];
    const bucketMinimums: Record<BucketId, number> = { B1: 1, B2: 2, B3: 1, B4: 1, D5: 1, M6: 0 };
    const franchInput = franchises.map(f => ({
      franchiseId: f.id,
      bucketCounts: f.squad?.bucketCounts || { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0, M6: 0 },
    }));

    const warnings: string[] = [];
    buckets.forEach(b => {
      const unsold = allLots.filter(l =>
        (l.bucket === b || l.bucketId === b) &&
        (l.status === 'AVAILABLE' || l.status === 'CALLED' || l.status === 'UNSOLD' || l.status === 'ROUND_2')
      ).length;

      const res = checkScarcity({
        bucket: b,
        unsoldPlayersInBucket: unsold,
        franchises: franchInput,
        bucketMinimums,
      });

      if (res.isScarcity) {
        warnings.push(`SCARCITY ALERT: ${BUCKET_LABELS[b]} (${b}) Supply is Low (${res.supply} unsold vs ${res.demand} needed)`);
      }
    });

    return warnings;
  }, [allLots, franchises]);

  return (
    <div className="h-screen w-screen bg-[#04070e] text-slate-900 font-sans overflow-hidden flex flex-col justify-between select-none">
      
      {/* Top Projector Bar */}
      <div className="border-b-2 border-slate-200 bg-white px-6 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center font-extrabold text-slate-950 font-mono text-xl shadow-md">
            ACC
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
              ACC 2026 · AVANTHI CRICKET CARNIVAL
            </div>
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mt-1">
              OFFICIAL HALL BROADCAST · 4K HIGH CONTRAST
            </div>
          </div>
        </div>

        {/* Center: Scarcity Warning Ticker if Active */}
        {scarcityWarnings.length > 0 && (
          <div className="bg-amber-500/20 border border-amber-500/50 px-4 py-1 rounded text-amber-300 font-mono text-xs font-bold uppercase tracking-wider animate-pulse">
            WARNING: {scarcityWarnings[0]}
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border",
            isOnline ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          )}>
            <span className={cn(
              "w-2.5 h-2.5 rounded-full",
              isOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
            )} />
            <span>{isOnline ? 'LIVE BROADCAST' : 'OFFLINE'}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="px-3 py-1 text-xs font-mono font-bold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-300 transition-colors"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Main Broadcast Stage */}
      <div className="flex-1 grid grid-cols-12 gap-8 p-8 items-center max-w-[1920px] mx-auto w-full">
        
        {/* Left Player Spotlight (5 Cols) */}
        <div className="col-span-5 flex items-center gap-8 bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="w-56 h-72 rounded-2xl bg-slate-50 border-2 border-slate-300 overflow-hidden flex items-center justify-center shrink-0 shadow-2xl relative">
            {currentLot?.photoUrl ? (
              <img src={currentLot.photoUrl} alt={currentLot.playerName} className="w-full h-full object-cover" />
            ) : (
              <span className="font-mono text-7xl font-extrabold text-slate-600">
                {currentLot?.playerName?.charAt(0) || 'P'}
              </span>
            )}
            <div className="absolute top-3 left-3 font-mono text-xs font-black uppercase px-2.5 py-1 rounded bg-black/80 text-amber-400 border border-amber-400/40">
              LOT #{currentLot?.lotNumber || currentLot?.drawNumber || 'B3-014'}
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 font-mono text-sm font-extrabold uppercase">
              {currentLot?.bucket || 'B3'} · {BUCKET_LABELS[currentLot?.bucket as BucketId] || '3rd Year'}
            </span>

            <h1 className="text-4xl xl:text-5xl font-black text-slate-900 uppercase tracking-tight leading-tight">
              {currentLot?.playerName || 'Player Name'}
            </h1>

            <div className="text-xl font-extrabold text-emerald-400 font-mono uppercase">
              {currentLot?.playerType || 'ALL_ROUNDER'}
            </div>

            <div className="text-sm font-mono text-slate-600">
              {currentLot?.program || 'B.Tech'} · {currentLot?.branch || 'ECE'} · Year {currentLot?.year || 3}
            </div>

            <div className="pt-2 border-t border-slate-200 text-sm font-mono text-slate-600">
              Base Price: <strong className="text-slate-900 text-base">{currentLot?.basePrice || 50} Credits</strong>
            </div>
          </div>
        </div>

        {/* Right Live Bid & Clock (7 Cols) */}
        <div className="col-span-7 bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-2xl flex flex-col justify-between h-full max-h-[520px]">
          
          {/* Top Clock Display */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <span className="font-mono text-sm font-bold uppercase tracking-widest text-slate-600">
              OFFICIAL AUCTION CLOCK
            </span>
            <div className={cn(
              "font-mono text-5xl xl:text-6xl font-black tabular-nums px-6 py-2 rounded-2xl border-2 flex items-center gap-3",
              timeLeft <= 5 ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse" :
              timeLeft <= 10 ? "bg-amber-500/20 border-amber-500 text-amber-400" :
              "bg-emerald-500/20 border-emerald-500 text-emerald-400"
            )}>
              
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* Center Dominant Price or Time Expired Unsold Notice */}
          <div className="text-center py-6 my-auto">
            {timeLeft <= 0 && (currentLot?.status === 'LIVE' || currentLot?.status === 'AVAILABLE') && !leaderId ? (
              <div className="flex flex-col items-center justify-center gap-4 animate-in zoom-in-95 duration-300">
                <img src="/unsold.svg" alt="Unsold" className="w-40 h-40 object-contain drop-shadow-2xl animate-pulse" />
                <div className="font-mono text-3xl font-black text-rose-600 uppercase tracking-widest bg-rose-50 border-2 border-rose-300 px-8 py-2 rounded-2xl shadow-sm">
                  TIME EXPIRED · UNSOLD
                </div>
                <div className="font-mono text-base font-bold text-slate-500">
                  Zero bids placed · Awaiting hammer to finalize for Round 2 recall
                </div>
              </div>
            ) : (
              <>
                <span className="font-mono text-sm xl:text-base font-extrabold uppercase tracking-widest text-amber-400">
                  CURRENT BID
                </span>
                <div className="text-7xl xl:text-9xl font-black font-mono text-amber-400 tabular-nums tracking-tight drop-shadow-[0_10px_25px_rgba(245,158,11,0.25)]">
                  {currentBidPrice} <span className="text-3xl xl:text-4xl text-slate-600 font-sans font-bold">CREDITS</span>
                </div>
              </>
            )}
          </div>

          {/* Leading Bidder Strip */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <span className="font-mono text-sm uppercase tracking-wider text-slate-600 font-bold">
              LEADING BIDDER:
            </span>
            {leaderId ? (
              <div className="flex items-center gap-3 bg-amber-500/10 border-2 border-amber-500/40 px-5 py-2.5 rounded-xl">
                <TeamEmblemBadge franchiseId={leaderId} name={leaderName || 'Team'} size={40} />
                <span className="font-mono text-2xl xl:text-3xl font-black text-amber-400 uppercase tracking-wide">
                  {leaderName}
                </span>
              </div>
            ) : (
              <div className="text-lg font-mono font-bold text-slate-500 uppercase px-4 py-2 rounded border border-slate-200">
                OPENING AT BASE PRICE
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Bottom 11-Franchise Ticker Strip */}
      <div className="border-t-2 border-slate-200 bg-white px-6 py-3.5 z-20">
        <div className="grid grid-cols-11 gap-2.5 max-w-[1920px] mx-auto">
          {franchises.map(f => {
            const isLeader = f.id === leaderId || f.name === leaderName;
            const status = auctionState?.franchiseStatuses?.[f.id] || 'IN_PLAY';
            const purse = f.purseRemaining !== undefined ? f.purseRemaining : (f.purse ?? 1000);

            return (
              <div
                key={f.id}
                className={cn(
                  "rounded-lg p-2 text-center border flex flex-col items-center justify-between transition-all",
                  isLeader ? "bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50" : "bg-[#0b1322] border-slate-200"
                )}
              >
                <div className="flex items-center gap-1.5 justify-center mb-1">
                  <TeamEmblemBadge franchiseId={f.id} name={f.name} size={22} />
                  <span className="font-bold text-xs text-slate-900 truncate max-w-[70px]">
                    {f.shortName || f.name.slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <div className="font-mono text-xs font-extrabold text-emerald-400 tabular-nums">
                  {purse}c
                </div>
                <div className={cn(
                  "w-full h-1.5 rounded-full mt-1.5",
                  status === 'IN_PLAY' ? "bg-emerald-500" :
                  status === 'PASSED' ? "bg-slate-600" : "bg-rose-500"
                )} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Sold Confirmation Animation Modal */}
      <SoldConfirmationModal
        isOpen={soldModalOpen}
        soldData={soldModalData}
        onClose={() => {
          setSoldModalOpen(false);
          setSoldModalData(null);
        }}
        autoCloseDurationMs={2800}
      />
    </div>
  );
}
