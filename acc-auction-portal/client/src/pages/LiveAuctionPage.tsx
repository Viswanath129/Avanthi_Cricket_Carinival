import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';

const EDITION_ID = 'acc-2026';

export default function LiveAuctionPage() {
  const [lot, setLot] = useState<any>(null);
  const [auctionState, setAuctionState] = useState<any>(null);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);

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

    // We assume there's a timestamp or similar we can order by. 
    // If auctionStatus isn't easily indexable with orderby out of the box, we just sort by soldPrice desc for top sales as an example.
    const q = query(
      collection(db, `editions/${EDITION_ID}/players`), 
      orderBy('soldPrice', 'desc'), 
      limit(10)
    );
    const unsubSales = onSnapshot(q, snap => {
      // Filter out unsold locally to avoid complex index requirements initially
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((d: any) => d.auctionStatus === 'SOLD');
      setRecentSales(docs);
    });

    return () => { unsubLot(); unsubState(); unsubFranchises(); unsubSales(); };
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-orange-500/30 flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-900 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <span className="font-heading font-bold text-xl tracking-tight text-white">ACC 2026</span>
            <nav className="hidden md:flex space-x-6 text-sm font-medium text-neutral-400">
              <span className="hover:text-white cursor-pointer transition-colors">Players</span>
              <span className="hover:text-white cursor-pointer transition-colors">Teams</span>
              <span className="text-orange-500">Live Auction</span>
            </nav>
          </div>
          <div>
            <Link href="/login" className="text-sm font-bold tracking-widest uppercase text-neutral-400 hover:text-white transition-colors">
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Player & Bid */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {showScarcity && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 rounded-lg text-yellow-500 text-sm font-medium uppercase tracking-wider">
              Scarcity Warning Active — Supply critically low for some buckets
            </div>
          )}

          {lot && isActive ? (
            <div className="border border-neutral-800 rounded-2xl bg-neutral-900/50 p-8 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
              
              <div className="flex flex-col items-center mb-8">
                <h1 className="font-heading text-5xl font-black uppercase tracking-tighter text-white mb-4 text-center">{lot.playerName}</h1>
                <div className="flex space-x-4">
                  <span className="bg-neutral-800 text-neutral-300 font-mono px-3 py-1 text-lg rounded border border-neutral-700">{lot.bucket}</span>
                  <span className="bg-neutral-800 text-neutral-300 font-mono px-3 py-1 text-lg rounded border border-neutral-700">{lot.playerType}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-16 w-full max-w-2xl mb-8">
                <div className="flex flex-col items-center">
                  <span className="text-neutral-500 uppercase tracking-widest font-bold mb-2">Current Bid</span>
                  <span className="font-mono text-6xl font-black text-orange-400 tracking-tighter">
                    ₹{lot.currentBid?.toLocaleString() || lot.basePrice?.toLocaleString()}
                  </span>
                  {lot.highestBidderName && (
                    <span className="mt-2 text-xl font-medium text-orange-500/80">{lot.highestBidderName}</span>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-neutral-500 uppercase tracking-widest font-bold mb-2">Time Left</span>
                  <span className={cn(
                    "font-mono text-6xl font-black tracking-tighter",
                    timeLeft <= 5 ? "text-red-500 animate-pulse" : timeLeft <= 15 ? "text-orange-500" : "text-white"
                  )}>
                    {timeLeft}s
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-neutral-800 rounded-2xl bg-neutral-900/50 p-16 flex items-center justify-center min-h-[400px]">
              <span className="text-2xl text-neutral-600 uppercase tracking-widest font-bold">Waiting for next player</span>
            </div>
          )}

          {/* Recent Sales Ticker */}
          <div className="border border-neutral-800 rounded-xl bg-neutral-900/30 p-6">
            <h3 className="text-neutral-500 uppercase tracking-widest text-sm font-bold mb-4">Recent Top Sales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recentSales.map(sale => (
                <div key={sale.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded text-sm">
                  <div className="font-bold text-white mb-1 truncate">{sale.playerName || sale.name}</div>
                  <div className="flex justify-between items-end">
                    <span className="text-neutral-400 text-xs">{sale.soldToName || sale.franchiseName}</span>
                    <span className="font-mono text-orange-400">₹{sale.soldPrice?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Franchise Grid */}
        <div className="lg:col-span-1">
          <div className="border border-neutral-800 rounded-xl bg-neutral-900/30 p-6 h-full">
            <h3 className="text-neutral-500 uppercase tracking-widest text-sm font-bold mb-6">Franchises</h3>
            <div className="flex flex-col gap-3">
              {franchises.map(franchise => {
                const status = auctionState?.franchiseStatuses?.[franchise.id] || 'IN_PLAY';
                return (
                  <div key={franchise.id} className="flex items-center justify-between p-3 rounded bg-neutral-900 border border-neutral-800">
                    <div>
                      <div className="font-bold text-neutral-200">{franchise.name}</div>
                      <div className="font-mono text-xs text-neutral-500 mt-1">₹{franchise.purse?.toLocaleString()} remaining</div>
                    </div>
                    <div className={cn(
                      "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border",
                      status === 'IN_PLAY' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                      status === 'PASSED' ? "bg-neutral-800 text-neutral-500 border-neutral-700" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {status}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
