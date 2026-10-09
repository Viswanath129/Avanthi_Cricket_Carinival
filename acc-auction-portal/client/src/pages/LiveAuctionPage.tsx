import React, { useState, useEffect, useMemo, useRef } from 'react';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { ref as rtdbRef, onValue } from 'firebase/database';
import { db, rtdb } from '@/lib/firebase';
import SoldConfirmationModal, { type SoldPlayerDetails } from '@/components/SoldConfirmationModal';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { BUCKET_LABELS, type BucketId } from '@shared/types';
import { calculateMaxBid } from '@shared/engine/bidEngine';
import { checkBucketEligibility } from '@shared/engine/bucketEligibility';
import { checkScarcity } from '@shared/engine/scarcity';

const EDITION_ID = 'acc-2026';

export const FRANCHISE_BRAND: Record<string | number, { name: string; short: string; color: string; bg: string; border: string }> = {
  1: { name: 'Titans', short: 'TIT', color: '#0284C7', bg: 'rgba(2, 132, 199, 0.12)', border: '#0284C7' },
  2: { name: 'Warriors', short: 'WAR', color: '#E11D48', bg: 'rgba(225, 29, 72, 0.12)', border: '#E11D48' },
  3: { name: 'Strikers', short: 'STR', color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)', border: '#D97706' },
  4: { name: 'Blasters', short: 'BLA', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)', border: '#059669' },
  5: { name: 'Super Kings', short: 'CSK', color: '#CA8A04', bg: 'rgba(202, 138, 4, 0.12)', border: '#CA8A04' },
  6: { name: 'Royals', short: 'RR', color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.12)', border: '#7C3AED' },
  7: { name: 'Challengers', short: 'RCB', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.12)', border: '#DC2626' },
  8: { name: 'Knights', short: 'KKR', color: '#4F46E5', bg: 'rgba(79, 70, 229, 0.12)', border: '#4F46E5' },
  9: { name: 'Daredevils', short: 'DD', color: '#EA580C', bg: 'rgba(234, 88, 12, 0.12)', border: '#EA580C' },
  10: { name: 'Sunrisers', short: 'SRH', color: '#F97316', bg: 'rgba(249, 115, 22, 0.12)', border: '#F97316' },
  11: { name: 'Giants', short: 'GNT', color: '#0D9488', bg: 'rgba(13, 148, 136, 0.12)', border: '#0D9488' }
};

export const DEFAULT_FRANCHISES = [
  { id: '1', name: 'Titans', shortName: 'TIT', purseRemaining: 1000, squad: { count: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '2', name: 'Warriors', shortName: 'WAR', purseRemaining: 1000, squad: { count: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '3', name: 'Strikers', shortName: 'STR', purseRemaining: 1000, squad: { count: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '4', name: 'Blasters', shortName: 'BLA', purseRemaining: 1000, squad: { count: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '5', name: 'Super Kings', shortName: 'CSK', purseRemaining: 1000, squad: { count: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '6', name: 'Royals', shortName: 'RR', purseRemaining: 1000, squad: { count: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '7', name: 'Challengers', shortName: 'RCB', purseRemaining: 1000, squad: { count: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '8', name: 'Knights', shortName: 'KKR', purseRemaining: 1000, squad: { count: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '9', name: 'Daredevils', shortName: 'DD', purseRemaining: 1000, squad: { count: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '10', name: 'Sunrisers', shortName: 'SRH', purseRemaining: 1000, squad: { count: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } },
  { id: '11', name: 'Giants', shortName: 'GNT', purseRemaining: 1000, squad: { count: 0, bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 } } }
];

export function TeamEmblemBadge({ franchiseId, name, size = 32 }: { franchiseId: string | number; name?: string; size?: number }) {
  const brand = FRANCHISE_BRAND[franchiseId] || FRANCHISE_BRAND[String(franchiseId)] || {
    name: name || 'Team',
    short: (name || 'TM').slice(0, 3).toUpperCase(),
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.12)',
    border: '#059669'
  };

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: brand.bg,
        borderColor: brand.border
      }}
      className="rounded-md border flex items-center justify-center shrink-0 shadow-sm font-black text-center select-none"
      title={name || brand.name}
    >
      <span style={{ color: brand.color, fontSize: `${Math.max(10, Math.round(size * 0.36))}px` }}>
        {brand.short}
      </span>
    </div>
  );
}

export default function LiveAuctionPage() {
  const [auctionState, setAuctionState] = useState<any>({
    status: 'LOT_OPEN',
    drawMode: 'AUTO',
    currentLotId: 'lot-1'
  });
  const [currentLot, setCurrentLot] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>(DEFAULT_FRANCHISES);
  const [acquisitions, setAcquisitions] = useState<any[]>([]);
  const [allLots, setAllLots] = useState<any[]>([]);
  
  // Realtime Presence & Clock Offset
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [serverOffset, setServerOffset] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Sold confirmation animation state
  const [soldModalOpen, setSoldModalOpen] = useState(false);
  const [soldModalData, setSoldModalData] = useState<SoldPlayerDetails | null>(null);
  const lastAnimatedSaleIdRef = useRef<string | null>(null);

  // Firestore listeners
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
    }, (err) => console.warn('[LiveAuction] state listener fallback:', err));

    const franchQ = query(collection(db, 'franchises'), where('editionId', '==', EDITION_ID));
    const franchUnsub = onSnapshot(franchQ, (snap) => {
      if (!snap.empty) {
        setFranchises(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    }, (err) => {
      console.warn('[LiveAuction] franchises listener fallback:', err);
      onSnapshot(query(collection(db, 'franchisesPublic'), where('editionId', '==', EDITION_ID)), (snapPub) => {
        if (!snapPub.empty) {
          setFranchises(snapPub.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      }, () => {});
    });

    const allLotsQ = query(collection(db, 'lots'), where('editionId', '==', EDITION_ID));
    const allLotsUnsub = onSnapshot(allLotsQ, (snap) => {
      if (!snap.empty) {
        setAllLots(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    }, (err) => console.warn('[LiveAuction] allLots listener fallback:', err));

    const acqQ = query(
      collection(db, 'acquisitions'),
      where('editionId', '==', EDITION_ID),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const acqUnsub = onSnapshot(acqQ, (snap) => {
      if (!snap.empty) {
        setAcquisitions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    }, (err) => console.warn('[LiveAuction] acquisitions listener fallback:', err));

    return () => {
      unsubConn();
      unsubOffset();
      stateUnsub();
      franchUnsub();
      allLotsUnsub();
      acqUnsub();
    };
  }, []);

  // Listen to current lot & bids
  useEffect(() => {
    if (!auctionState?.currentLotId) {
      // Fallback default lot for smooth spectator presentation
      setCurrentLot({
        id: 'lot-1',
        drawNumber: 1,
        lotNumber: 'B3-014',
        playerName: 'Sai Teja',
        rollNumber: '25811A0403',
        bucket: 'B3',
        playerType: 'ALL_ROUNDER',
        basePrice: 50,
        status: 'AVAILABLE',
        currentPrice: 140,
        highestBidderId: '1',
        highestBidderName: 'Titans',
        timerDeadline: Date.now() + 18000,
        stats: { matches: 24, runs: 480, wickets: 18, highestScore: '68*' }
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
      limit(15)
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

  const bucketMinimums: Record<BucketId, number> = useMemo(() => ({
    B1: 1,
    B2: 2,
    B3: 1,
    B4: 1,
    D5: 1,
    M6: 0
  }), []);

  const highestBid = bids[0];
  const currentBidPrice = highestBid?.amount || currentLot?.currentPrice || currentLot?.basePrice || 50;
  const leadingFranchiseName = highestBid?.franchiseName || currentLot?.highestBidderName || 'None';
  const leadingFranchiseId = highestBid?.franchiseId || currentLot?.highestBidderId || null;

  // Next Minimum Bid
  const nextMinBid = useMemo(() => {
    if (!highestBid && (!currentLot?.currentPrice || currentLot.currentPrice === currentLot.basePrice)) {
      return currentLot?.basePrice || 20;
    }
    const currentAmount = highestBid ? highestBid.amount : currentLot.currentPrice;
    let increment = 10;
    if (currentAmount >= 200) increment = 30;
    else if (currentAmount >= 100) increment = 20;
    else increment = 10;
    return currentAmount + increment;
  }, [highestBid, currentLot]);

  // Evaluated Franchises
  const evaluatedFranchises = useMemo(() => {
    const curBucket: BucketId = currentLot?.bucket || currentLot?.bucketId || 'B3';

    return franchises.map(f => {
      const purse = f.purseRemaining !== undefined ? f.purseRemaining : (f.purse ?? 1000);
      const squadCount = f.squad?.count ?? 0;
      const auctionPurchases = f.squad?.auctionPurchases ?? squadCount;
      const bucketCounts = f.squad?.bucketCounts || { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0, M6: 0 };

      const maxBidRes = calculateMaxBid({
        purseRemaining: purse,
        auctionPurchasesSoFar: auctionPurchases,
        bucketCounts,
        currentPlayerBucket: curBucket,
        minAuctionPurchases: 15,
        bucketMinimums,
      });

      const eligRes = checkBucketEligibility({
        purseRemaining: purse,
        auctionPurchasesSoFar: auctionPurchases,
        bucketCounts,
        currentPlayerBucket: curBucket,
        currentPrice: nextMinBid,
        minAuctionPurchases: 15,
        bucketMinimums,
      });

      const isExplicitPass = auctionState?.franchiseStatuses?.[f.id] === 'PASSED' || f.status === 'PASSED';
      let liveState: 'IN_PLAY' | 'PASSED' | 'BLOCKED' = 'IN_PLAY';
      let blockedReason: string | null = null;

      if (squadCount >= 15) {
        liveState = 'BLOCKED';
        blockedReason = 'SQUAD_CAP';
      } else if (isExplicitPass) {
        liveState = 'PASSED';
      } else if (!eligRes.eligible) {
        liveState = 'BLOCKED';
        blockedReason = maxBidRes.maxBid < nextMinBid ? 'NO_PURSE' : 'SLOT_PROTECTION';
      }

      return {
        ...f,
        purse,
        squadCount,
        bucketCounts,
        maxBid: maxBidRes.maxBid,
        liveState,
        blockedReason
      };
    });
  }, [franchises, currentLot, nextMinBid, bucketMinimums, auctionState?.franchiseStatuses]);

  const inPlayFranchises = evaluatedFranchises.filter(f => f.liveState === 'IN_PLAY');
  const passedFranchises = evaluatedFranchises.filter(f => f.liveState === 'PASSED');
  const blockedFranchises = evaluatedFranchises.filter(f => f.liveState === 'BLOCKED');

  // Scarcity Data
  const scarcityWarnings = useMemo(() => {
    const buckets: BucketId[] = ['B3', 'B4', 'B2', 'D5', 'B1'];
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
        warnings.push(`Scarcity Alert: ${BUCKET_LABELS[b]} (${b}) supply is critical. ${res.supply} unsold remaining, ${res.demand} needed across 11 teams.`);
      }
    });

    return warnings;
  }, [allLots, franchises, bucketMinimums]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-amber-500/30">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-amber-400 transition-colors">
                ACC 2026
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                AUCTION FLOOR
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
              <Link href="/players" className="hover:text-slate-900 transition-colors">Players</Link>
              <Link href="/teams" className="hover:text-slate-900 transition-colors">Teams</Link>
              <Link href="/live" className="text-amber-400 font-bold">Live Auction</Link>
              <Link href="/projector" className="hover:text-slate-900 transition-colors">Hall Projector</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Presence indicator */}
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border",
              isOnline ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            )}>
              <span className={cn(
                "w-2 h-2 rounded-full",
                isOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
              )} />
              <span>{isOnline ? 'LIVE BROADCAST' : 'RECONNECTING'}</span>
            </div>

            <Link href="/login" className="text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded border border-slate-200 hover:border-slate-300 transition-colors">
              Staff Login
            </Link>
          </div>
        </div>
      </header>

      {/* Scarcity Warning Banners */}
      {scarcityWarnings.length > 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-center text-xs md:text-sm font-bold text-amber-300 uppercase tracking-wide flex items-center justify-center gap-2">
          
          <span>{scarcityWarnings[0]}</span>
        </div>
      )}

      {/* Main Content Floor */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Top Lot Strip + Live Bid Spotlight Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Current Lot Card (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-extrabold uppercase px-2.5 py-1 rounded bg-slate-800 text-amber-400 border border-slate-300">
                  LOT #{currentLot?.lotNumber || currentLot?.drawNumber || 'B3-014'}
                </span>
                <span className={cn(
                  "text-[11px] font-extrabold font-mono uppercase px-2.5 py-1 rounded border",
                  currentLot?.status === 'SOLD' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                  currentLot?.status === 'UNSOLD' ? "bg-rose-500/10 text-rose-400 border-rose-500/30" :
                  "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                )}>
                  {currentLot?.status || 'IN PLAY'}
                </span>
              </div>

              {/* Player Identity Photo & Name */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg bg-slate-900 border border-slate-300/80 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                  {currentLot?.photoUrl ? (
                    <img src={currentLot.photoUrl} alt={currentLot.playerName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-mono text-3xl font-extrabold text-slate-600">
                      {currentLot?.playerName?.charAt(0) || 'P'}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-900 truncate tracking-tight">
                    {currentLot?.playerName || 'Rahul Sharma'}
                  </h1>
                  <p className="text-xs font-mono text-slate-600 mt-0.5">
                    Roll: {currentLot?.rollNumber ? `${currentLot.rollNumber.slice(0, 5)}***` : '25811A****'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
                      {currentLot?.bucket || 'B3'} · {BUCKET_LABELS[currentLot?.bucket as BucketId] || '3rd Year'}
                    </span>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      {currentLot?.playerType || 'ALL_ROUNDER'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-center mb-4">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">Matches</div>
                  <div className="font-mono text-sm font-bold text-slate-900 tabular-nums">{currentLot?.stats?.matches || 18}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">Runs</div>
                  <div className="font-mono text-sm font-bold text-slate-900 tabular-nums">{currentLot?.stats?.runs || 420}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">Wickets</div>
                  <div className="font-mono text-sm font-bold text-slate-900 tabular-nums">{currentLot?.stats?.wickets || 14}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">Best</div>
                  <div className="font-mono text-sm font-bold text-slate-900 tabular-nums">{currentLot?.stats?.highestScore || '65*'}</div>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 italic text-right mb-2">
                * Self-declared player statistics
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Base Price:</span>
              <span className="font-mono font-bold text-slate-200 tabular-nums">
                {currentLot?.basePrice || 50} Credits
              </span>
            </div>
          </div>

          {/* Live Bid Panel (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
            {/* Top Row: Timer & Leading Bidder */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
              <div>
                <span className="text-xs uppercase font-mono text-slate-600 font-bold tracking-wider">Leading Bidder</span>
                <div className="flex items-center gap-2 mt-1">
                  {leadingFranchiseId ? (
                    <>
                      <TeamEmblemBadge franchiseId={leadingFranchiseId} name={leadingFranchiseName} size={28} />
                      <span className="font-extrabold text-lg sm:text-xl text-amber-400 tracking-tight">
                        {leadingFranchiseName}
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-slate-500 text-sm">Awaiting First Bid</span>
                  )}
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="flex flex-col items-end">
                <span className="text-xs uppercase font-mono text-slate-600 font-bold tracking-wider mb-1">Lot Clock</span>
                <div className={cn(
                  "font-mono text-3xl sm:text-4xl font-extrabold tabular-nums px-3 py-1 rounded-md border flex items-center gap-1.5",
                  timeLeft <= 5 ? "bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse" :
                  timeLeft <= 10 ? "bg-amber-500/10 border-amber-500/40 text-amber-400" :
                  "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                )}>
                  
                  <span>{timeLeft}s</span>
                </div>
              </div>
            </div>

            {/* Center: Dominant Current Bid or Expired / Unsold Banner */}
            <div className="py-6 text-center my-auto">
              {timeLeft <= 0 && (currentLot?.status === 'LIVE' || currentLot?.status === 'AVAILABLE') && !leadingFranchiseId ? (
                <div className="flex flex-col items-center justify-center gap-2.5 animate-in zoom-in-95 duration-300">
                  <img src="/unsold.svg" alt="Unsold" className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-md animate-pulse" />
                  <div className="font-mono text-base sm:text-lg font-black text-rose-600 uppercase tracking-wider bg-rose-50 border border-rose-200 px-4 py-1 rounded-lg">
                    TIME EXPIRED · UNSOLD
                  </div>
                  <div className="font-mono text-xs text-slate-500 font-medium">
                    No bids received · Awaiting hammer to finalize for Round 2 recall
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-xs uppercase font-mono text-amber-400/80 tracking-widest font-extrabold">
                    CURRENT BID
                  </span>
                  <div className="text-5xl sm:text-6xl md:text-7xl font-extrabold font-mono text-amber-400 tabular-nums tracking-tight mt-1 drop-shadow-md">
                    {currentBidPrice} <span className="text-2xl sm:text-3xl text-slate-600 font-bold font-sans">Credits</span>
                  </div>
                  <div className="text-xs font-mono text-slate-600 mt-2">
                    Minimum next bid: <span className="text-slate-900 font-bold">{nextMinBid} Credits</span>
                  </div>
                </>
              )}
            </div>

            {/* Franchise Status Pills Bar */}
            <div className="pt-4 border-t border-slate-200/80">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-600 font-bold uppercase tracking-wider">Franchise Floor State</span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">{inPlayFranchises.length} In Play</span>
                  <span className="text-slate-600 font-bold">{passedFranchises.length} Passed</span>
                  <span className="text-rose-400 font-bold">{blockedFranchises.length} Blocked</span>
                </div>
              </div>

              {/* Franchise Quick Status Dots */}
              <div className="flex flex-wrap gap-1.5">
                {evaluatedFranchises.map(f => (
                  <span
                    key={f.id}
                    title={`${f.name}: ${f.liveState}`}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors",
                      f.liveState === 'IN_PLAY' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" :
                      f.liveState === 'PASSED' ? "bg-slate-800/80 border-slate-300 text-slate-600" :
                      "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    )}
                  >
                    {f.shortName || f.name.slice(0, 3).toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 11-Franchise Live Standings Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm uppercase tracking-wide text-slate-900">11 Official Franchises</span>
              <span className="text-xs font-mono text-slate-600">· Real-Time Purse & Quota Tracker</span>
            </div>
            <span className="text-xs font-mono text-slate-600">Squad Target: 15 Players</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Franchise</th>
                  <th className="py-2.5 px-3 text-right">Purse Left</th>
                  <th className="py-2.5 px-3 text-right">Max Bid</th>
                  <th className="py-2.5 px-3 text-center">Squad</th>
                  <th className="py-2.5 px-3 text-center">B1..D5 Quotas</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {evaluatedFranchises.map(f => {
                  const bCounts = f.bucketCounts || { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 };
                  const isLeader = f.id === leadingFranchiseId || f.name === leadingFranchiseName;

                  return (
                    <tr
                      key={f.id}
                      className={cn(
                        "transition-colors",
                        isLeader ? "bg-amber-500/10 font-medium" : "hover:bg-slate-800/20"
                      )}
                    >
                      <td className="py-2.5 px-4 flex items-center gap-2.5">
                        <TeamEmblemBadge franchiseId={f.id} name={f.name} size={22} />
                        <span className="font-bold text-slate-900 truncate">{f.name}</span>
                        {isLeader && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400 text-black font-extrabold uppercase">
                            LEADER
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 tabular-nums">
                        {f.purse}c
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300 tabular-nums font-semibold">
                        {f.maxBid}c
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-300 tabular-nums">
                        {f.squadCount} / 15
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex gap-1 text-[9px] font-mono">
                          <span className={cn("px-1 py-0.2 rounded", bCounts.B1 >= 1 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500")}>B1:{bCounts.B1}/1</span>
                          <span className={cn("px-1 py-0.2 rounded", bCounts.B2 >= 2 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500")}>B2:{bCounts.B2}/2</span>
                          <span className={cn("px-1 py-0.2 rounded", bCounts.B3 >= 1 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500")}>B3:{bCounts.B3}/1</span>
                          <span className={cn("px-1 py-0.2 rounded", bCounts.B4 >= 1 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500")}>B4:{bCounts.B4}/1</span>
                          <span className={cn("px-1 py-0.2 rounded", bCounts.D5 >= 1 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500")}>D5:{bCounts.D5}/1</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                          f.liveState === 'IN_PLAY' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                          f.liveState === 'PASSED' ? "bg-slate-800 text-slate-600 border border-slate-300" :
                          "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        )}>
                          {f.liveState}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Ticker: Recent Hammered & Allotted Lots */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wide text-slate-300 flex items-center gap-1.5">
              
              <span>Recent Completed Lots</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Live Official Results</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {acquisitions.slice(0, 4).map(acq => (
              <div key={acq.id} className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 truncate max-w-[120px]">{acq.playerName}</div>
                  <div className="text-[10px] text-slate-600">{acq.franchiseName}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-amber-400">{acq.price || acq.soldPrice}c</div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase">
                    {acq.status === 'ALLOTTED' ? 'ALLOTTED' : 'SOLD'}
                  </span>
                </div>
              </div>
            ))}
            {acquisitions.length === 0 && (
              <div className="col-span-full py-4 text-center text-xs text-slate-500 font-mono">
                No lots concluded yet in this auction session.
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-[#090e1a] py-4 text-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
        Avanthi Cricket Carnival (ACC 2026) · Official Server-Authoritative Public Broadcast
      </footer>

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
