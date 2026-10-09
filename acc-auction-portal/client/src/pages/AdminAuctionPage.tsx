import React, { useState, useEffect, useRef } from 'react';
import { doc, collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import SoldConfirmationModal, { type SoldPlayerDetails } from '@/components/SoldConfirmationModal';
// import { checkScarcity } from '@shared/engine/scarcity';
// import { calculateMaxBid } from '@shared/engine/bidEngine';
// import { checkBucketEligibility } from '@shared/engine/bucketEligibility';

import { calculateNextBid } from '@shared/engine/bidEngine';
import { useServerTime } from '@/hooks/useServerTime';

// Hardcoded for now as requested
const EDITION_ID = 'acc-2026';

export default function AdminAuctionPage() {
  const { offset: serverOffset, computeRemainingSeconds } = useServerTime();
  const [auctionState, setAuctionState] = useState<any>(null);
  const [currentLot, setCurrentLot] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [acquisitions, setAcquisitions] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [undoModalOpen, setUndoModalOpen] = useState(false);
  const [undoReason, setUndoReason] = useState('');
  const [selectedUndoSale, setSelectedUndoSale] = useState<any>(null);
  const [hammerModalOpen, setHammerModalOpen] = useState(false);
  const [drawMode, setDrawMode] = useState<'GUEST' | 'AUTO'>('GUEST');

  // Sold confirmation animation state
  const [soldModalOpen, setSoldModalOpen] = useState(false);
  const [soldModalData, setSoldModalData] = useState<SoldPlayerDetails | null>(null);
  const lastAnimatedSaleIdRef = useRef<string | null>(null);

  const openLotFn = httpsCallable(functions, 'openLot');
  const skipLotFn = httpsCallable(functions, 'skipLot');
  const hammerLotFn = httpsCallable(functions, 'hammerLot');
  const undoSaleFn = httpsCallable(functions, 'undoSale');
  const passFranchiseFn = httpsCallable(functions, 'passFranchise');
  const pauseResumeFn = httpsCallable(functions, 'pauseResumeAuction');

  useEffect(() => {
    // Listen to auction state
    const stateUnsub = onSnapshot(doc(db, 'editions', EDITION_ID, 'auction', 'state'), (stateSnap) => {
      if (stateSnap.exists()) {
        const data = stateSnap.data();
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

    // Listen to franchises
    const franchQ = query(collection(db, 'franchises'), where('editionId', '==', EDITION_ID));
    const franchUnsub = onSnapshot(franchQ, (snapshot) => {
      setFranchises(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Listen to all acquisitions for undo modal, and recent 5 for sidebar
    const acqQ = query(collection(db, 'acquisitions'), where('editionId', '==', EDITION_ID), orderBy('timestamp', 'desc'));
    const acqUnsub = onSnapshot(acqQ, (snapshot) => {
      setAcquisitions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      stateUnsub();
      franchUnsub();
      acqUnsub();
    };
  }, []);

  // Dedicated current lot & bids subscription with clean teardown
  useEffect(() => {
    if (!auctionState?.currentLotId) {
      setCurrentLot(null);
      setBids([]);
      return;
    }

    const lotUnsub = onSnapshot(doc(db, 'lots', auctionState.currentLotId), (lotDoc: any) => {
      if (lotDoc.exists()) {
        setCurrentLot({ id: lotDoc.id, ...lotDoc.data() });
      } else {
        setCurrentLot(null);
      }
    });

    const bidsQ = query(
      collection(db, 'bids'), 
      where('lotId', '==', auctionState.currentLotId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const bidsUnsub = onSnapshot(bidsQ, (snapshot) => {
      setBids(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      lotUnsub();
      bidsUnsub();
    };
  }, [auctionState?.currentLotId]);

  // Timer effect (Authoritative server deadline derivation)
  useEffect(() => {
    const isBidding = currentLot && (
      currentLot.status === 'LIVE' || 
      currentLot.status === 'BIDDING' || 
      currentLot.status === 'AVAILABLE' ||
      auctionState?.status === 'LIVE' || 
      auctionState?.status === 'BIDDING'
    );

    if (!isBidding) {
      setTimeLeft(0);
      return;
    }

    if (auctionState?.status === 'PAUSED' || currentLot?.timerRunning === false) {
      const pausedMs = typeof currentLot?.pausedRemainingMs === 'number'
        ? currentLot.pausedRemainingMs
        : (typeof auctionState?.pausedRemainingMs === 'number' ? auctionState.pausedRemainingMs : 0);
      setTimeLeft(Math.max(0, Math.ceil(pausedMs / 1000)));
      return;
    }

    const deadlineRaw = currentLot?.timerDeadline || auctionState?.timerDeadline;
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
    currentLot?.id,
    currentLot?.status,
    currentLot?.timerRunning,
    currentLot?.pausedRemainingMs,
    currentLot?.timerDeadline?.seconds || currentLot?.timerDeadline,
    auctionState?.status,
    auctionState?.pausedRemainingMs,
    auctionState?.timerDeadline?.seconds || auctionState?.timerDeadline,
    serverOffset,
  ]);

  const handleOpenLot = async () => {
    if (!currentLot?.id) return;
    try { await openLotFn({ editionId: EDITION_ID, lotId: currentLot.id }); } catch (e) { console.error(e); }
  };
  const handleSkipLot = async () => {
    if (!currentLot?.id) return;
    try { await skipLotFn({ editionId: EDITION_ID, lotId: currentLot.id }); } catch (e) { console.error(e); }
  };
  const handleHammerLot = () => {
    setHammerModalOpen(true);
  };
  const confirmHammerLot = async () => {
    try {
      const isSold = !!(highestBid || currentLot?.highestBidderFranchiseId || currentLot?.highestBidderId);
      await hammerLotFn({
        editionId: EDITION_ID,
        lotId: currentLot?.id,
        expectedOutcome: isSold ? 'SOLD' : 'UNSOLD',
      });
      setHammerModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };
  const handleTogglePause = async () => {
    try { await pauseResumeFn({ editionId: EDITION_ID }); } catch (e) { console.error(e); }
  };
  const handleUndoSale = async () => {
    if (!selectedUndoSale || !undoReason) return;
    try { 
      await undoSaleFn({ editionId: EDITION_ID, acquisitionId: selectedUndoSale.id, reason: undoReason });
      setUndoModalOpen(false);
      setUndoReason('');
      setSelectedUndoSale(null);
    } catch (e) { console.error(e); }
  };
  const handleTogglePass = async (franchiseId: string, currentStatus: string) => {
    try { await passFranchiseFn({ editionId: EDITION_ID, franchiseId, pass: currentStatus !== 'PASSED' }); } catch (e) { console.error(e); }
  };

  const getTimerColor = () => {
    if (timeLeft > 10) return 'text-green-500';
    if (timeLeft > 5) return 'text-orange-500';
    return 'text-red-500 animate-pulse';
  };

  const highestBid = bids.length > 0 ? bids[0] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-inter p-4 flex flex-col">
      {/* TOP BAR */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
        <div>
          <h1 className="font-space font-bold text-2xl text-slate-100">ACC 2026 Admin Panel</h1>
          <p className="font-mono text-sm text-slate-400">
            {auctionState?.status === 'LIVE' ? (
              <span className="text-green-500">LIVE</span>
            ) : (
              <span className="text-orange-500">PAUSED</span>
            )} 
            {' '} | Round: {auctionState?.currentRound || 1} | Bucket: {currentLot?.bucket || 'None'}
          </p>
        </div>
        <div>
          <div className="flex border border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setDrawMode('GUEST')}
              className={`px-4 py-1.5 text-xs font-bold font-mono transition-all ${
                drawMode === 'GUEST' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              GUEST
            </button>
            <button
              onClick={() => setDrawMode('AUTO')}
              className={`px-4 py-1.5 text-xs font-bold font-mono transition-all ${
                drawMode === 'AUTO' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              AUTO
            </button>
          </div>
        </div>
      </header>

      <main className="flex gap-6 flex-1 h-full">
        {/* LEFT COLUMN (60%) */}
        <div className="w-3/5 flex flex-col gap-6">
          
          {/* CURRENT LOT CARD */}
          <div className="border border-slate-800 bg-slate-900 rounded-lg p-6">
            <h2 className="font-mono text-slate-500 text-sm mb-2 uppercase">Current Lot</h2>
            {currentLot ? (
              <div className="flex gap-6">
                <div className="flex-1">
                  <div className="font-mono text-5xl font-bold text-slate-100 mb-4">#{currentLot.drawNumber}</div>
                  <h3 className="font-space text-3xl font-bold text-white mb-2">{currentLot.playerName}</h3>
                  <div className="font-mono text-sm text-slate-400 flex flex-col gap-1 mb-4">
                    <span>Roll: {currentLot.rollNumber}</span>
                    <span>Branch: {currentLot.branch} | Year: {currentLot.year}</span>
                    <span>Bucket: {currentLot.bucket} | Type: {currentLot.playerType}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-4 mt-4 grid grid-cols-4 gap-4">
                    <div><span className="block font-mono text-xs text-slate-500">RUNS</span><span className="font-mono text-lg">{currentLot.stats?.runs || 0}</span></div>
                    <div><span className="block font-mono text-xs text-slate-500">WKTS</span><span className="font-mono text-lg">{currentLot.stats?.wickets || 0}</span></div>
                    <div><span className="block font-mono text-xs text-slate-500">SR</span><span className="font-mono text-lg">{currentLot.stats?.strikeRate || 0}</span></div>
                    <div><span className="block font-mono text-xs text-slate-500">CT</span><span className="font-mono text-lg">{currentLot.stats?.catches || 0}</span></div>
                  </div>
                </div>
                <div className="w-48 flex flex-col justify-between">
                  <div className="aspect-square bg-slate-800 border border-slate-700 rounded flex items-center justify-center font-mono text-slate-600 text-xs text-center p-4">
                    {currentLot.photoUrl ? <img src={currentLot.photoUrl} alt="Player" className="w-full h-full object-cover" /> : 'NO PHOTO'}
                  </div>
                  <div className="mt-4 bg-slate-950 border border-slate-800 rounded p-3 text-center">
                    <span className="block font-mono text-xs text-slate-500 mb-1">BASE PRICE</span>
                    <span className="font-mono text-xl text-slate-300">{currentLot.basePrice || 0}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 font-mono">No Active Lot</div>
            )}
          </div>

          {/* BID SECTION */}
          <div className="flex gap-4">
            <div className="flex-1 border border-slate-800 bg-slate-900 rounded-lg p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <span className="font-mono text-sm text-slate-500 mb-2">CURRENT BID</span>
              <div className="font-mono text-7xl font-bold text-orange-500 mb-2">{highestBid?.amount || currentLot?.basePrice || 0}</div>
              <div className="font-space text-xl text-slate-300">{highestBid?.franchiseName || 'NO BIDS'}</div>
              
              <div className="mt-6 flex justify-between w-full border-t border-slate-800 pt-4">
                <div className="text-left">
                  <span className="block font-mono text-xs text-slate-500">NEXT BID</span>
                  <span className="font-mono text-lg text-emerald-400 font-bold">{calculateNextBid(highestBid?.amount || currentLot?.basePrice || 20)} Credits</span>
                </div>
                <div className="text-right">
                  <span className="block font-mono text-xs text-slate-500">TIME REMAINING</span>
                  <span className={`font-mono text-3xl font-bold ${getTimerColor()}`}>{timeLeft}s</span>
                </div>
              </div>
            </div>
            
            <div className="w-1/3 border border-slate-800 bg-slate-900 rounded-lg p-4 flex flex-col">
              <span className="font-mono text-sm text-slate-500 mb-3 block">HISTORY</span>
              <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                {bids.map(bid => (
                  <div key={bid.id} className="flex justify-between items-center text-sm font-mono border-b border-slate-800 pb-2">
                    <span className="text-slate-300">{bid.franchiseName}</span>
                    <span className="text-orange-400">{bid.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="grid grid-cols-5 gap-4">
            <button onClick={handleOpenLot} className="py-4 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold rounded">OPEN</button>
            <button onClick={handleSkipLot} className="py-4 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold rounded">SKIP</button>
            <button onClick={handleTogglePause} className="py-4 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold rounded">
              {auctionState?.status === 'LIVE' ? 'PAUSE' : 'RESUME'}
            </button>
            <button onClick={() => setUndoModalOpen(true)} className="py-4 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold rounded">UNDO</button>
            <button onClick={handleHammerLot} className="py-4 bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-lg rounded shadow-[0_0_15px_rgba(234,88,12,0.3)] border border-orange-500">HAMMER</button>
          </div>

        </div>

        {/* RIGHT COLUMN (40%) */}
        <div className="w-2/5 flex flex-col gap-6">
          
          {/* FRANCHISE STATUS GRID */}
          <div className="border border-slate-800 bg-slate-900 rounded-lg p-4 flex-1">
            <h2 className="font-mono text-slate-500 text-sm mb-4">Franchises</h2>
            <div className="grid grid-cols-2 gap-3">
              {franchises.map(f => {
                const isPassed = f.status === 'PASSED';
                const isBlocked = f.status === 'BLOCKED';
                let borderColor = 'border-slate-700';
                if (isPassed) borderColor = 'border-slate-600';
                if (isBlocked) borderColor = 'border-red-900';
                if (!isPassed && !isBlocked) borderColor = 'border-green-900';

                return (
                  <div key={f.id} className={`border ${borderColor} bg-slate-950 rounded p-3 flex flex-col`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-space font-bold text-sm text-slate-200 truncate">{f.name}</span>
                      <button 
                        onClick={() => handleTogglePass(f.id, f.status)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isPassed ? 'border-green-800 text-green-500' : 'border-slate-700 text-slate-400'}`}
                      >
                        {isPassed ? 'UNPASS' : 'PASS'}
                      </button>
                    </div>
                    <div className="flex justify-between font-mono text-xs text-slate-400">
                      <span>P: <span className="text-slate-200">{f.purse}</span></span>
                      <span>S: <span className="text-slate-200">{f.squadCount}/15</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SCARCITY PANEL */}
          <div className="border border-slate-800 bg-slate-900 rounded-lg p-4">
            <h2 className="font-mono text-slate-500 text-sm mb-4">Scarcity Overview</h2>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1">
                <span>BUCKET</span>
                <span>DEMAND / SUPPLY</span>
              </div>
              {/* Dummy data for scarcity for now */}
              <div className="flex justify-between text-slate-300 py-1">
                <span>B1 - B.Tech 1st Yr</span>
                <span className="text-green-500">12 / 24</span>
              </div>
              <div className="flex justify-between text-slate-300 py-1 bg-yellow-900/20 text-yellow-500 px-1 -mx-1">
                <span>B3 - B.Tech 3rd Yr</span>
                <span>15 / 14</span>
              </div>
            </div>
          </div>

          {/* RECENT SALES */}
          <div className="border border-slate-800 bg-slate-900 rounded-lg p-4">
            <h2 className="font-mono text-slate-500 text-sm mb-4">Recent Sales</h2>
            <div className="space-y-3">
              {acquisitions.slice(0, 5).map(sale => (
                <div key={sale.id} className="flex justify-between items-center font-mono text-xs border-b border-slate-800 pb-2">
                  <div className="flex flex-col">
                    <span className="text-slate-200 font-bold">{sale.playerName}</span>
                    <span className="text-slate-500">#{sale.drawNumber} | {sale.franchiseName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-400 font-bold">{sale.price}</span>
                    <button 
                      onClick={() => { setSelectedUndoSale(sale); setUndoModalOpen(true); }}
                      className="border border-slate-700 px-2 py-1 rounded text-slate-400 hover:text-white"
                    >
                      UNDO
                    </button>
                  </div>
                </div>
              ))}
              {acquisitions.length === 0 && <div className="text-slate-600 font-mono text-xs">No sales yet.</div>}
            </div>
          </div>

        </div>
      </main>

      {/* UNDO MODAL */}
      {undoModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] flex flex-col">
            <h2 className="font-space font-bold text-xl text-white mb-4">Undo Sale</h2>
            
            <div className="flex-1 overflow-y-auto border border-slate-800 rounded mb-4 p-2 space-y-2">
              {acquisitions.map(sale => {
                const isSelected = selectedUndoSale?.id === sale.id;
                const isUndone = sale.status === 'UNDONE';
                return (
                  <div 
                    key={sale.id} 
                    onClick={() => !isUndone && setSelectedUndoSale(sale)}
                    className={`flex justify-between items-center p-3 rounded font-mono text-sm border cursor-pointer
                      ${isUndone ? 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed' : 
                        isSelected ? 'bg-slate-800 border-orange-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                      }`}
                  >
                    <div>
                      <span className="text-slate-400 mr-2">#{sale.drawNumber}</span>
                      <span className={isUndone ? 'text-slate-500' : 'text-slate-200'}>{sale.playerName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={isUndone ? 'text-slate-600' : 'text-slate-400'}>{sale.franchiseName}</span>
                      <span className={isUndone ? 'text-slate-600' : 'text-orange-400 font-bold'}>{sale.price}</span>
                      {isUndone && <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-xs">UNDONE</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedUndoSale && (
              <div className="mb-4">
                <label className="block font-mono text-xs text-slate-500 mb-2">Reason for Undo (Required)</label>
                <input 
                  type="text" 
                  value={undoReason}
                  onChange={(e) => setUndoReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Accidental hammer, invalid bid..."
                />
              </div>
            )}

            <div className="flex justify-end gap-3 mt-auto">
              <button 
                onClick={() => { setUndoModalOpen(false); setSelectedUndoSale(null); setUndoReason(''); }}
                className="px-4 py-2 border border-slate-700 rounded font-mono text-sm text-slate-300 hover:bg-slate-800"
              >
                CANCEL
              </button>
              <button 
                onClick={handleUndoSale}
                disabled={!selectedUndoSale || !undoReason}
                className="px-4 py-2 bg-red-900/50 border border-red-800 rounded font-mono text-sm text-red-200 hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CONFIRM UNDO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-STEP HAMMER CONFIRMATION MODAL */}
      {hammerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-orange-500/50 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center text-xl font-bold">
                \uD83D\uDD28
              </div>
              <div>
                <h3 className="font-space font-bold text-lg text-white">CONFIRM HAMMER COMMIT</h3>
                <p className="text-xs font-mono text-slate-400">Two-Step Authority Verification</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Player:</span>
                <span className="font-bold text-white">{currentLot?.playerName || 'Active Player'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Committed Price:</span>
                <span className="font-bold text-orange-400">{highestBid?.amount || currentLot?.basePrice || 0} Credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Winning Franchise:</span>
                <span className="font-bold text-emerald-400">{highestBid?.franchiseName || 'NO BIDS (MARK UNSOLD)'}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              {highestBid
                ? 'Committing hammer will atomically deduct purse credits, allocate player into squad roster, and log immutable transaction.'
                : 'No bids placed. Committing hammer will officially mark this player as UNSOLD.'}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                autoFocus
                onClick={() => setHammerModalOpen(false)}
                className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl font-mono text-xs font-bold"
              >
                CANCEL
              </button>
              <button
                onClick={confirmHammerLot}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-mono text-xs font-bold shadow-lg shadow-orange-600/30"
              >
                [ CONFIRM HAMMER ]
              </button>
            </div>
          </div>
        </div>
      )}

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
