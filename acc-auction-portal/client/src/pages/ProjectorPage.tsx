import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

const EDITION_ID = 'acc-2026';

export default function ProjectorPage() {
  const [lot, setLot] = useState<any>(null);
  const [auctionState, setAuctionState] = useState<any>(null);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);

  // Auto-fullscreen
  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
    return () => { document.exitFullscreen?.().catch(() => {}); };
  }, []);

  useEffect(() => {
    const unsubLot = onSnapshot(doc(db, `editions/${EDITION_ID}/auction/currentLot`), snap => {
      setLot(snap.exists() ? snap.data() : null);
    });
    
    const unsubState = onSnapshot(doc(db, `editions/${EDITION_ID}/auction/state`), snap => {
      setAuctionState(snap.exists() ? snap.data() : null);
    });

    const unsubFranchises = onSnapshot(collection(db, `editions/${EDITION_ID}/franchises`), snap => {
      setFranchises(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubLot(); unsubState(); unsubFranchises(); };
  }, []);

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

  const isActive = lot?.status === 'ACTIVE';
  const showScarcity = auctionState?.scarcityWarnings && Object.keys(auctionState.scarcityWarnings).length > 0;

  return (
    <div className="h-screen w-screen bg-neutral-950 text-neutral-100 font-sans overflow-hidden flex flex-col selection:bg-orange-500/30">
      {/* Scarcity Warning Header */}
      {showScarcity && (
        <div className="w-full bg-yellow-500 text-yellow-950 font-bold uppercase tracking-widest text-xl py-3 px-8 flex justify-center items-center h-[5vh]">
          Supply Critically Low For Certain Buckets — Bidding Strategies Must Adjust
        </div>
      )}

      {isActive && lot ? (
        <div className="flex flex-row flex-grow h-[80vh]">
          {/* Left: Player Photo Area */}
          <div className="w-[40%] bg-neutral-900 border-r border-neutral-800 flex flex-col justify-end relative overflow-hidden">
            {lot.photoUrl ? (
              <img src={lot.photoUrl} alt={lot.playerName} className="absolute inset-0 w-full h-full object-cover opacity-80" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-neutral-800 font-black text-9xl tracking-tighter">PHOTO</div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
            <div className="relative p-12 pb-16 z-10">
              <div className="font-mono text-3xl text-neutral-400 mb-2">LOT #{lot.lotNumber || '—'}</div>
              <div className="font-mono text-2xl bg-neutral-800 text-neutral-300 inline-block px-4 py-2 rounded">
                Base Price: ₹{lot.basePrice?.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Right: Info & Bids */}
          <div className="w-[60%] flex flex-col p-16 justify-between relative">
            <div>
              <h1 className="font-heading text-8xl font-black uppercase tracking-tighter text-white leading-none mb-8">
                {lot.playerName}
              </h1>
              
              <div className="flex gap-6 mb-12">
                <span className="font-mono text-4xl text-neutral-400 border border-neutral-800 px-6 py-3 rounded-lg bg-neutral-900/50">
                  {lot.bucket}
                </span>
                <span className="font-mono text-4xl text-neutral-400 border border-neutral-800 px-6 py-3 rounded-lg bg-neutral-900/50">
                  {lot.playerType}
                </span>
              </div>
            </div>

            {/* Bottom Bar: Bid & Timer */}
            <div className="flex justify-between items-end border-t border-neutral-800 pt-12">
              <div className="flex flex-col">
                <span className="text-2xl text-neutral-500 uppercase tracking-widest font-bold mb-4">Current Bid</span>
                <span className="font-mono text-9xl font-black text-orange-500 tracking-tighter leading-none">
                  ₹{lot.currentBid?.toLocaleString() || lot.basePrice?.toLocaleString()}
                </span>
                {lot.highestBidderName && (
                  <span className="mt-6 text-4xl font-bold text-orange-400/80 uppercase tracking-wider">
                    {lot.highestBidderName}
                  </span>
                )}
              </div>

              <div className="flex flex-col items-end">
                <span className="text-2xl text-neutral-500 uppercase tracking-widest font-bold mb-4">Time</span>
                <span className={cn(
                  "font-mono text-9xl font-black tracking-tighter leading-none",
                  timeLeft <= 5 ? "text-red-500" : timeLeft <= 15 ? "text-orange-500" : "text-white"
                )}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center h-[80vh]">
          <span className="text-6xl text-neutral-700 font-bold uppercase tracking-widest">Waiting for lot</span>
        </div>
      )}

      {/* Footer: Franchises */}
      <div className="h-[15vh] bg-neutral-900 border-t border-neutral-800 flex items-center px-8">
        <div className="flex w-full justify-between gap-4">
          {franchises.map(franchise => {
            const status = auctionState?.franchiseStatuses?.[franchise.id] || 'IN_PLAY';
            return (
              <div className="flex flex-col items-center flex-1" key={franchise.id}>
                <div className="text-xl font-bold text-white mb-2 uppercase tracking-wider text-center truncate w-full px-2">
                  {franchise.shortName || franchise.name}
                </div>
                <div className={cn(
                  "w-full h-3 rounded-full",
                  status === 'IN_PLAY' ? "bg-green-500" :
                  status === 'PASSED' ? "bg-neutral-600" :
                  "bg-red-500"
                )} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
