import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BUCKET_LABELS, type BucketId } from '@shared/types';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { FRANCHISE_BRAND, TeamEmblemBadge } from './LiveAuctionPage';

const EDITION_ID = 'acc-2026';

const BUCKET_MINIMUMS: Record<BucketId, number> = {
  B1: 1,
  B2: 2,
  B3: 1,
  B4: 1,
  D5: 1,
  M6: 0,
};

const OFFICIAL_11_FRANCHISES = [
  { id: '1', name: 'Titans', shortName: 'TIT', coordinatorName: 'Dr. K. Srinivas', department: 'ECE', purseInitial: 1000, purseRemaining: 860, squadCount: 2 },
  { id: '2', name: 'Warriors', shortName: 'WAR', coordinatorName: 'Prof. M. R. Varma', department: 'CSE', purseInitial: 1000, purseRemaining: 1000, squadCount: 0 },
  { id: '3', name: 'Strikers', shortName: 'STR', coordinatorName: 'Dr. P. Ramesh', department: 'MECH', purseInitial: 1000, purseRemaining: 1000, squadCount: 0 },
  { id: '4', name: 'Blasters', shortName: 'BLA', coordinatorName: 'Prof. S. Anjaneyulu', department: 'EEE', purseInitial: 1000, purseRemaining: 1000, squadCount: 0 },
  { id: '5', name: 'Super Kings', shortName: 'CSK', coordinatorName: 'Dr. G. Venkat', department: 'CIVIL', purseInitial: 1000, purseRemaining: 1000, squadCount: 0 },
  { id: '6', name: 'Royals', shortName: 'RR', coordinatorName: 'Prof. V. Sharma', department: 'IT', purseInitial: 1000, purseRemaining: 1000, squadCount: 0 },
  { id: '7', name: 'Challengers', shortName: 'RCB', coordinatorName: 'Dr. H. Prasad', department: 'CSE', purseInitial: 1000, purseRemaining: 1000, squadCount: 0 },
  { id: '8', name: 'Knights', shortName: 'KKR', coordinatorName: 'Prof. B. Krishna', department: 'ECE', purseInitial: 1000, purseRemaining: 1000, squadCount: 0 },
  { id: '9', name: 'Daredevils', shortName: 'DD', coordinatorName: 'Dr. C. Naidu', department: 'MECH', purseInitial: 1000, purseRemaining: 1000, squadCount: 0 },
  { id: '10', name: 'Sunrisers', shortName: 'SRH', coordinatorName: 'Prof. L. Murthy', department: 'EEE', purseInitial: 1000, purseRemaining: 1000, squadCount: 0 },
  { id: '11', name: 'Giants', shortName: 'GNT', coordinatorName: 'Dr. T. Reddy', department: 'CIVIL', purseInitial: 1000, purseRemaining: 1000, squadCount: 0 },
];

export default function TeamsBoardPage() {
  const [franchises, setFranchises] = useState<any[]>(OFFICIAL_11_FRANCHISES);
  const [acquisitions, setAcquisitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>('1');

  useEffect(() => {
    const q = query(
      collection(db, 'franchises'),
      where('editionId', '==', EDITION_ID)
    );
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setFranchises(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
      setLoading(false);
    }, (err) => {
      console.warn('Franchises listener fallback to default set:', err);
      setLoading(false);
    });

    const acqQ = query(
      collection(db, 'acquisitions'),
      where('editionId', '==', EDITION_ID),
      orderBy('createdAt', 'desc')
    );
    const unsubAcq = onSnapshot(acqQ, (snap) => {
      if (!snap.empty) {
        setAcquisitions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    }, () => {});

    return () => {
      unsub();
      unsubAcq();
    };
  }, []);

  const selected = useMemo(() => {
    return franchises.find(f => f.id === selectedFranchiseId || String(f.id) === String(selectedFranchiseId)) || franchises[0];
  }, [franchises, selectedFranchiseId]);

  const teamAcquisitions = useMemo(() => {
    if (!selected) return [];
    return acquisitions.filter(a => a.franchiseId === selected.id || a.franchiseName === selected.name);
  }, [acquisitions, selected]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-amber-500/30">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-amber-400 transition-colors">
                ACC 2026
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                11 FRANCHISES
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
              <Link href="/players" className="hover:text-slate-900 transition-colors">Players</Link>
              <Link href="/teams" className="text-amber-400 font-bold">Teams</Link>
              <Link href="/live" className="hover:text-slate-900 transition-colors">Live Auction</Link>
              <Link href="/projector" className="hover:text-slate-900 transition-colors">Hall Projector</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/live" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase px-3 py-1.5 rounded transition-colors shadow-sm">
              Watch Live Auction →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Title Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Official Franchise Directory</h1>
            <p className="text-xs font-mono text-slate-600 mt-1">
              ACC 2026 Participating Teams · Squad Rosters, Purse Balances & Quota Compliance
            </p>
          </div>
          <div className="font-mono text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded">
            Target Squad: <strong className="text-slate-900">15 Players</strong> (1000 Credits Initial Purse)
          </div>
        </div>

        {/* 2-Column Layout: Left List of 11 Teams, Right Detail Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 11 Franchises Grid (7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {franchises.map(f => {
              const isSelected = selected?.id === f.id;
              const purse = f.purseRemaining !== undefined ? f.purseRemaining : (f.purse ?? 1000);
              const squadCount = f.squad?.count ?? f.squadCount ?? 0;
              const bCounts = f.squad?.bucketCounts || { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0 };

              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFranchiseId(f.id)}
                  className={cn(
                    "text-left p-4 rounded-xl border transition-all flex flex-col justify-between shadow-md",
                    isSelected
                      ? "bg-[#111a2e] border-amber-400/80 ring-1 ring-amber-400/40"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-[#0d1628]"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <TeamEmblemBadge franchiseId={f.id} name={f.name} size={34} />
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base leading-tight">{f.name}</h3>
                          <span className="font-mono text-[10px] text-slate-600 uppercase tracking-wider">
                            {f.shortName || f.name.slice(0, 3).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-extrabold text-emerald-400 tabular-nums">
                        {purse}c
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-600 mb-3 bg-slate-50 border border-slate-200/80 rounded px-2.5 py-1.5">
                      <span>Squad: <strong className="text-slate-900">{squadCount} / 15</strong></span>
                      <span>Rem: <strong className="text-amber-400">{15 - squadCount} slots</strong></span>
                    </div>

                    {/* Bucket Quotas Strip */}
                    <div className="grid grid-cols-5 gap-1 text-center font-mono text-[9px]">
                      {(['B1', 'B2', 'B3', 'B4', 'D5'] as BucketId[]).map(b => {
                        const cnt = bCounts[b] || 0;
                        const min = BUCKET_MINIMUMS[b];
                        const met = cnt >= min;
                        return (
                          <div
                            key={b}
                            className={cn(
                              "py-1 rounded border",
                              met ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-slate-900 border-slate-200 text-slate-500"
                            )}
                          >
                            <div className="font-bold">{cnt}/{min}</div>
                            <div className="text-[8px] uppercase">{b}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{f.coordinatorName || f.coordinator?.name || 'Assigned Lead'}</span>
                    <span className={isSelected ? "text-amber-400 font-bold" : "text-slate-600"}>
                      {isSelected ? "● Selected" : "Inspect →"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Franchise Detail Card & Squad Roster (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xl space-y-6">
            {selected && (
              <>
                {/* Header Profile */}
                <div className="flex items-center gap-4 pb-5 border-b border-slate-200">
                  <TeamEmblemBadge franchiseId={selected.id} name={selected.name} size={54} />
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{selected.name}</h2>
                    <p className="text-xs font-mono text-slate-600 mt-0.5">
                      Coordinator: <span className="text-slate-200 font-bold">{selected.coordinatorName || selected.coordinator?.name || 'Faculty Representative'}</span> ({selected.department || selected.coordinator?.department || 'Engineering'})
                    </p>
                    <p className="text-[10px] font-mono text-emerald-400 mt-0.5">
                      * Official Franchise Account · Verified
                    </p>
                  </div>
                </div>

                {/* Financial & Squad Metrics */}
                <div className="grid grid-cols-3 gap-2.5 bg-slate-50 border border-slate-200 rounded-lg p-3 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Purse Left</span>
                    <span className="text-base font-extrabold text-emerald-400 tabular-nums">
                      {selected.purseRemaining !== undefined ? selected.purseRemaining : (selected.purse ?? 1000)}c
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Spent</span>
                    <span className="text-base font-extrabold text-amber-400 tabular-nums">
                      {1000 - (selected.purseRemaining !== undefined ? selected.purseRemaining : (selected.purse ?? 1000))}c
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Roster</span>
                    <span className="text-base font-extrabold text-slate-900 tabular-nums">
                      {selected.squad?.count ?? selected.squadCount ?? 0} / 15
                    </span>
                  </div>
                </div>

                {/* Bucket Completion Detailed */}
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                    Mandatory Quota Breakdown
                  </h4>
                  <div className="space-y-1.5 font-mono text-xs">
                    {(['B1', 'B2', 'B3', 'B4', 'D5'] as BucketId[]).map(b => {
                      const count = selected.squad?.bucketCounts?.[b] || 0;
                      const min = BUCKET_MINIMUMS[b];
                      const met = count >= min;
                      return (
                        <div key={b} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded border border-slate-200/80">
                          <span className="text-slate-300">
                            {b} — {BUCKET_LABELS[b]}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded font-extrabold text-[11px]",
                            met ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          )}>
                            {count} / {min} {met ? ' (OK)' : ' (REQ)'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Acquired Players Roster */}
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center justify-between">
                    <span>Acquired Players ({teamAcquisitions.length})</span>
                    <span className="text-[10px] text-slate-500">Live Auction Picks</span>
                  </h4>

                  {teamAcquisitions.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                      <p className="text-xs font-mono text-slate-500">No players acquired yet in active session.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {teamAcquisitions.map((acq, i) => (
                        <div key={acq.id || i} className="flex items-center justify-between bg-slate-50 border border-slate-200 px-3 py-2 rounded text-xs">
                          <div>
                            <div className="font-bold text-slate-900">{acq.playerName}</div>
                            <div className="text-[10px] font-mono text-slate-600">
                              {acq.bucket} · {acq.playerType || 'PLAYER'}
                            </div>
                          </div>
                          <div className="text-right font-mono font-bold text-amber-400">
                            {acq.price || acq.soldPrice}c
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </>
            )}
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-[#090e1a] py-4 text-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
        Avanthi Cricket Carnival (ACC 2026) · Public Franchise Directory
      </footer>
    </div>
  );
}
