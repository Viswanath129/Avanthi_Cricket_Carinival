import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { calculateMaxBid, calculateNextBid } from '@shared/engine/bidEngine';
import { checkBucketEligibility } from '@shared/engine/bucketEligibility';
import { DEFAULT_SQUAD_RULES } from '@shared/types';
import { nanoid } from 'nanoid';
import { cn } from '@/lib/utils';

const EDITION_ID = 'acc-2026';

export default function FranchiseBiddingPage() {
  const { user } = useAuth();
  const [franchiseId, setFranchiseId] = useState<string | null>(null);
  const [lot, setLot] = useState<any>(null);
  const [auctionState, setAuctionState] = useState<any>(null);
  const [franchise, setFranchise] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch franchise ID based on user
  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, `editions/${EDITION_ID}/franchiseUsers`, user.uid);
    const unsub = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        setFranchiseId(snap.data().franchiseId);
      } else if (user.franchiseId) {
        setFranchiseId(user.franchiseId);
      }
    });
    return () => unsub();
  }, [user]);

  // Listeners
  useEffect(() => {
    if (!franchiseId) return;
    
    let isMounted = true;
    const unsubLot = onSnapshot(doc(db, `editions/${EDITION_ID}/auction/currentLot`), (snap) => {
      if (isMounted) setLot(snap.exists() ? snap.data() : null);
    }, () => setIsConnected(false));

    const unsubState = onSnapshot(doc(db, `editions/${EDITION_ID}/auction/state`), (snap) => {
      if (isMounted) setAuctionState(snap.exists() ? snap.data() : null);
      setIsConnected(true);
    }, () => setIsConnected(false));

    const unsubFranchise = onSnapshot(doc(db, `editions/${EDITION_ID}/franchises`, franchiseId), (snap) => {
      if (isMounted) setFranchise(snap.exists() ? snap.data() : null);
      setIsConnected(true);
    }, () => setIsConnected(false));

    return () => {
      isMounted = false;
      unsubLot();
      unsubState();
      unsubFranchise();
    };
  }, [franchiseId]);

  // Timer
  useEffect(() => {
    if (!lot?.timerDeadline) {
      setTimeLeft(0);
      return;
    }
    const interval = setInterval(() => {
      const deadline = lot.timerDeadline?.toMillis ? lot.timerDeadline.toMillis() : lot.timerDeadline;
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
    }, 100);
    return () => clearInterval(interval);
  }, [lot?.timerDeadline]);

  const handleBid = async () => {
    if (isSubmitting || !franchiseId || !lot) return;
    setIsSubmitting(true);
    setError(null);
    if (navigator.vibrate) navigator.vibrate(50);
    
    try {
      const placeBid = httpsCallable(functions, 'placeBid');
      await placeBid({
        editionId: EDITION_ID,
        franchiseId,
        playerId: lot.playerId,
        bidAmount: calculateNextBid(lot.currentBid || lot.basePrice || 0),
        clientActionId: nanoid()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to place bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePassToggle = async (action: 'PASS' | 'UNPASS') => {
    if (isSubmitting || !franchiseId) return;
    setIsSubmitting(true);
    setError(null);
    if (navigator.vibrate) navigator.vibrate(20);

    try {
      const passFranchise = httpsCallable(functions, 'passFranchise');
      await passFranchise({
        editionId: EDITION_ID,
        franchiseId,
        action,
        clientActionId: nanoid()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to pass/rejoin');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!franchiseId) {
    return <div className="p-4 text-center text-neutral-400 bg-neutral-950 h-screen w-full flex items-center justify-center font-sans tracking-widest uppercase">Loading franchise data...</div>;
  }

  const maxBid = franchise ? calculateMaxBid(franchise.purse, franchise.squadCount) : 0;
  const nextBid = lot ? calculateNextBid(lot.currentBid || lot.basePrice || 0) : 0;
  const bucketEligible = (franchise && lot) ? checkBucketEligibility(franchise.bucketCounts, lot.bucket, DEFAULT_SQUAD_RULES) : true;
  
  const franchiseStatus = auctionState?.franchiseStatuses?.[franchiseId] || 'IN_PLAY';
  const isActive = lot?.status === 'ACTIVE';

  return (
    <div className="flex flex-col h-[100dvh] bg-neutral-950 text-neutral-100 font-sans px-4 py-6 selection:bg-orange-500/30">
      {/* 1. Connection Status */}
      <div className="flex items-center space-x-2 mb-4 justify-center">
        <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500 animate-pulse")} />
        <span className={cn("text-sm font-medium tracking-wide uppercase", isConnected ? "text-green-500" : "text-red-500")}>
          {isConnected ? "Connected" : "Reconnecting..."}
        </span>
      </div>

      {lot && isActive ? (
        <div className="flex flex-col flex-grow">
          {/* 2. Current Player */}
          <div className="text-center mb-6">
            <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-white mb-1">{lot.playerName}</h1>
            <div className="flex justify-center space-x-3 text-sm font-medium">
              <span className="text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">{lot.bucket}</span>
              <span className="text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">{lot.playerType}</span>
            </div>
          </div>

          {/* 3. Current Bid */}
          <div className="text-center mb-8">
            <p className="text-sm text-neutral-500 uppercase tracking-widest mb-2 font-medium">Current Bid</p>
            <div className="font-mono text-5xl font-bold tracking-tighter text-orange-400">
              ₹{lot.currentBid?.toLocaleString() || lot.basePrice?.toLocaleString()}
            </div>
            {lot.highestBidderName && (
              <p className="text-orange-500/80 mt-2 font-medium">by {lot.highestBidderName}</p>
            )}
          </div>

          {/* 4. Next Bid & 5. Max Bid */}
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-6">
            <div className="flex flex-col">
              <span className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Next Bid</span>
              <span className="font-mono text-xl text-neutral-200">₹{nextBid.toLocaleString()}</span>
            </div>
            <div className="w-px h-8 bg-neutral-800"></div>
            <div className="flex flex-col text-right">
              <span className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Max Legal Bid</span>
              <span className="font-mono text-xl text-neutral-200">₹{maxBid.toLocaleString()}</span>
            </div>
          </div>

          {/* 6. Timer */}
          <div className="text-center mb-8">
            <div className={cn(
              "font-mono text-6xl font-bold tracking-tighter",
              timeLeft <= 5 ? "text-red-500 animate-pulse" : timeLeft <= 15 ? "text-orange-500" : "text-neutral-200"
            )}>
              {timeLeft}s
            </div>
          </div>

          {/* 7. Buttons */}
          <div className="flex flex-col gap-3 mt-auto">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded text-center">
                {error}
              </div>
            )}
            
            {franchiseStatus === 'BLOCKED' ? (
              <div className="bg-red-950 border border-red-900 text-red-500 py-4 text-center font-bold tracking-widest uppercase rounded">
                Blocked
              </div>
            ) : franchiseStatus === 'PASSED' ? (
              <button
                onClick={() => handlePassToggle('UNPASS')}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-5 rounded tracking-widest uppercase transition-colors"
              >
                Rejoin Bidding
              </button>
            ) : (
              <>
                <button
                  onClick={handleBid}
                  disabled={isSubmitting || nextBid > maxBid || !bucketEligible || lot.highestBidder === franchiseId}
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold py-6 rounded tracking-widest uppercase text-xl transition-colors active:scale-95"
                >
                  {lot.highestBidder === franchiseId ? 'Current Highest' : `Bid ₹${nextBid.toLocaleString()}`}
                </button>
                <button
                  onClick={() => handlePassToggle('PASS')}
                  disabled={isSubmitting}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 font-bold py-4 rounded tracking-widest uppercase transition-colors"
                >
                  Pass
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-neutral-500 uppercase tracking-widest font-medium">Waiting for next lot...</p>
        </div>
      )}

      {/* 8. Purse & 9. Bucket Status */}
      {franchise && (
        <div className="mt-8 pt-6 border-t border-neutral-900">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Purse Remaining</p>
              <p className="font-mono text-2xl font-bold text-neutral-200">₹{franchise.purse?.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Squad Size</p>
              <p className="font-mono text-xl text-neutral-300">{franchise.squadCount || 0} / {DEFAULT_SQUAD_RULES.maxTotalSize}</p>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {['B1', 'B2', 'B3', 'B4', 'D5', 'M6'].map(b => (
              <div key={b} className="bg-neutral-900 border border-neutral-800 p-1 rounded text-center">
                <div className="text-[10px] text-neutral-500 font-bold">{b}</div>
                <div className="font-mono text-xs text-neutral-300">{franchise.bucketCounts?.[b] || 0}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
