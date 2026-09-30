import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BUCKET_LABELS, type BucketId } from '@shared/types';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

const EDITION_ID = 'acc-2026';

const BUCKET_COLORS: Record<BucketId, { bg: string; text: string; border: string }> = {
  B1: { bg: 'rgba(34, 197, 94, 0.12)', text: '#22c55e', border: '#22c55e' },
  B2: { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6', border: '#3b82f6' },
  B3: { bg: 'rgba(168, 85, 247, 0.12)', text: '#a855f7', border: '#a855f7' },
  B4: { bg: 'rgba(249, 115, 22, 0.12)', text: '#f97316', border: '#f97316' },
  D5: { bg: 'rgba(234, 179, 8, 0.12)', text: '#eab308', border: '#eab308' },
  M6: { bg: 'rgba(236, 72, 153, 0.12)', text: '#ec4899', border: '#ec4899' },
};

// Rich default roster to ensure the public catalog is immediately functional
const DEFAULT_PLAYERS = [
  {
    id: 'p-1',
    name: 'Sai Teja',
    rollNumber: '25811A0403',
    academic: { program: 'B.Tech', branch: 'ECE', studyYear: 3, bucket: 'B3' as BucketId },
    derived: { playerType: 'ALL_ROUNDER', battingArm: 'RIGHT', bowlingStyle: 'RIGHT_FAST' },
    basePrice: 50,
    auctionStatus: 'AVAILABLE',
    cricHeroesStatus: 'VERIFIED',
    stats: { matches: 28, runs: 640, wickets: 22, strikeRate: 142.5, catches: 12, highestScore: '74*' }
  },
  {
    id: 'p-2',
    name: 'Rohit Varma',
    rollNumber: '25811A0512',
    academic: { program: 'B.Tech', branch: 'CSE', studyYear: 4, bucket: 'B4' as BucketId },
    derived: { playerType: 'BATTER', battingArm: 'RIGHT', bowlingStyle: 'NONE' },
    basePrice: 60,
    auctionStatus: 'AVAILABLE',
    cricHeroesStatus: 'VERIFIED',
    stats: { matches: 34, runs: 980, wickets: 0, strikeRate: 136.2, catches: 18, highestScore: '102*' }
  },
  {
    id: 'p-3',
    name: 'Karthik Reddy',
    rollNumber: '25811A0321',
    academic: { program: 'B.Tech', branch: 'MECH', studyYear: 2, bucket: 'B2' as BucketId },
    derived: { playerType: 'BOWLER', battingArm: 'RIGHT', bowlingStyle: 'RIGHT_SPIN' },
    basePrice: 40,
    auctionStatus: 'AVAILABLE',
    cricHeroesStatus: 'PENDING',
    stats: { matches: 20, runs: 85, wickets: 31, strikeRate: 95.0, catches: 6, highestScore: '22' }
  },
  {
    id: 'p-4',
    name: 'Manish Kumar',
    rollNumber: '25811A0108',
    academic: { program: 'Diploma', branch: 'CIVIL', studyYear: 3, bucket: 'D5' as BucketId },
    derived: { playerType: 'WK_BATTER', battingArm: 'LEFT', bowlingStyle: 'NONE' },
    basePrice: 50,
    auctionStatus: 'AVAILABLE',
    cricHeroesStatus: 'VERIFIED',
    stats: { matches: 26, runs: 520, wickets: 0, strikeRate: 128.4, catches: 22, highestScore: '61' }
  },
  {
    id: 'p-5',
    name: 'Akhil Royal',
    rollNumber: '25811A1204',
    academic: { program: 'B.Tech', branch: 'IT', studyYear: 1, bucket: 'B1' as BucketId },
    derived: { playerType: 'ALL_ROUNDER', battingArm: 'RIGHT', bowlingStyle: 'RIGHT_FAST' },
    basePrice: 30,
    auctionStatus: 'AVAILABLE',
    cricHeroesStatus: 'VERIFIED',
    stats: { matches: 15, runs: 310, wickets: 12, strikeRate: 150.1, catches: 5, highestScore: '55*' }
  },
  {
    id: 'p-6',
    name: 'Praveen Das',
    rollNumber: '25811A0445',
    academic: { program: 'B.Tech', branch: 'ECE', studyYear: 3, bucket: 'B3' as BucketId },
    derived: { playerType: 'BOWLER', battingArm: 'RIGHT', bowlingStyle: 'LEFT_FAST' },
    basePrice: 40,
    auctionStatus: 'AVAILABLE',
    cricHeroesStatus: 'VERIFIED',
    stats: { matches: 22, runs: 45, wickets: 29, strikeRate: 80.0, catches: 8, highestScore: '14*' }
  },
  {
    id: 'p-7',
    name: 'Suresh Babu',
    rollNumber: '25811A0210',
    academic: { program: 'B.Tech', branch: 'EEE', studyYear: 2, bucket: 'B2' as BucketId },
    derived: { playerType: 'BATTER', battingArm: 'LEFT', bowlingStyle: 'RIGHT_SPIN' },
    basePrice: 50,
    auctionStatus: 'AVAILABLE',
    cricHeroesStatus: 'PENDING',
    stats: { matches: 19, runs: 410, wickets: 4, strikeRate: 121.0, catches: 9, highestScore: '58' }
  },
  {
    id: 'p-8',
    name: 'Naveen Chary',
    rollNumber: '25811D0502',
    academic: { program: 'Diploma', branch: 'CSE', studyYear: 2, bucket: 'D5' as BucketId },
    derived: { playerType: 'BOWLER', battingArm: 'RIGHT', bowlingStyle: 'RIGHT_FAST' },
    basePrice: 30,
    auctionStatus: 'AVAILABLE',
    cricHeroesStatus: 'VERIFIED',
    stats: { matches: 16, runs: 35, wickets: 24, strikeRate: 75.0, catches: 4, highestScore: '12' }
  }
];

export default function PlayerBoardPage() {
  const [players, setPlayers] = useState<any[]>(DEFAULT_PLAYERS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bucketFilter, setBucketFilter] = useState<BucketId | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'playersPublic'),
      where('editionId', '==', EDITION_ID)
    );
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPlayers(data);
      }
      setLoading(false);
    }, (err) => {
      console.warn('playersPublic listener fallback to default set:', err);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const b = p.academic?.bucket || p.bucket;
      if (bucketFilter !== 'ALL' && b !== bucketFilter) return false;

      const t = p.derived?.playerType || p.playerType;
      if (typeFilter !== 'ALL' && t !== typeFilter) return false;

      if (search.trim()) {
        const s = search.toLowerCase();
        const nameMatch = p.name?.toLowerCase().includes(s) || p.playerName?.toLowerCase().includes(s);
        const branchMatch = p.academic?.branch?.toLowerCase().includes(s);
        const rollMatch = p.rollNumber?.toLowerCase().includes(s);
        if (!nameMatch && !branchMatch && !rollMatch) return false;
      }
      return true;
    });
  }, [players, bucketFilter, typeFilter, search]);

  const playerTypes = ['ALL', 'BATTER', 'BOWLER', 'ALL_ROUNDER', 'WK_BATTER'];
  const bucketOptions: (BucketId | 'ALL')[] = ['ALL', 'B1', 'B2', 'B3', 'B4', 'D5'];

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
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold">
                PLAYER DIRECTORY
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
              <Link href="/players" className="text-amber-400 font-bold">Players</Link>
              <Link href="/teams" className="hover:text-slate-900 transition-colors">Teams</Link>
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
        
        {/* Top Title Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Official Player Catalog</h1>
            <p className="text-xs font-mono text-slate-600 mt-1">
              Phase 1 Verified Nominations · Approved for ACC 2026 Auction Pools
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-slate-600">
            <span className="bg-white border border-slate-200 px-3 py-1.5 rounded">
              Total Catalog: <strong className="text-slate-900">{players.length}</strong>
            </span>
            <span className="bg-white border border-slate-200 px-3 py-1.5 rounded">
              Showing: <strong className="text-amber-400">{filteredPlayers.length}</strong>
            </span>
          </div>
        </div>

        {/* Filters Row */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-xl">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm">
                <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input
                type="text"
                placeholder="Search by player name, branch (CSE, ECE, MECH), or roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="px-3 py-2 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Bucket Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-mono text-slate-500 uppercase font-bold shrink-0">Bucket:</span>
            {bucketOptions.map(b => (
              <button
                key={b}
                onClick={() => setBucketFilter(b)}
                className={cn(
                  "px-2.5 py-1 text-xs font-mono font-bold rounded border transition-colors shrink-0",
                  bucketFilter === b
                    ? "bg-amber-400 text-slate-950 border-amber-400 font-extrabold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                )}
              >
                {b === 'ALL' ? 'All Buckets' : `${b} (${BUCKET_LABELS[b as BucketId]})`}
              </button>
            ))}
          </div>

          {/* Role Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-mono text-slate-500 uppercase font-bold shrink-0">Role:</span>
            {playerTypes.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "px-2.5 py-1 text-xs font-mono font-bold rounded border transition-colors shrink-0",
                  typeFilter === t
                    ? "bg-blue-500 text-slate-900 border-blue-500 font-extrabold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                )}
              >
                {t === 'ALL' ? 'All Roles' : t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Players Grid */}
        {filteredPlayers.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-slate-200 rounded-xl bg-white/50">
            <p className="text-slate-600 font-medium">No players found matching your filter criteria.</p>
            <button
              onClick={() => { setSearch(''); setBucketFilter('ALL'); setTypeFilter('ALL'); }}
              className="mt-3 text-xs font-mono text-amber-400 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPlayers.map(p => {
              const b = (p.academic?.bucket || p.bucket || 'B1') as BucketId;
              const brand = BUCKET_COLORS[b] || BUCKET_COLORS.B1;
              const type = p.derived?.playerType || p.playerType || 'BATTER';
              const name = p.name || p.playerName;
              const roll = p.rollNumber ? `${p.rollNumber.slice(0, 5)}***` : '25811A****';

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlayer(p)}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    {/* Top strip: Bucket & Price */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        style={{ backgroundColor: brand.bg, color: brand.text, borderColor: brand.border }}
                        className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border uppercase"
                      >
                        {b} · {BUCKET_LABELS[b]}
                      </span>
                      <span className="font-mono font-extrabold text-sm text-amber-400 tabular-nums">
                        {p.basePrice || 50} Credits
                      </span>
                    </div>

                    {/* Photo + Identity */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-14 h-16 rounded bg-slate-900 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-mono font-extrabold text-xl text-slate-600">
                            {name?.charAt(0) || 'P'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-amber-400 transition-colors">
                          {name}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-600 mt-0.5 truncate">
                          {p.academic?.program || 'B.Tech'} {p.academic?.branch || 'ECE'} · Yr {p.academic?.studyYear || 3}
                        </p>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold block mt-1">
                          {type}
                        </span>
                      </div>
                    </div>

                    {/* Stats strip */}
                    <div className="grid grid-cols-4 gap-1 bg-slate-50 border border-slate-200/80 rounded p-2 text-center text-xs font-mono">
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase">Mat</div>
                        <div className="font-bold text-slate-900 tabular-nums">{p.stats?.matches || 0}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase">Runs</div>
                        <div className="font-bold text-slate-900 tabular-nums">{p.stats?.runs || 0}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase">Wkts</div>
                        <div className="font-bold text-slate-900 tabular-nums">{p.stats?.wickets || 0}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase">Best</div>
                        <div className="font-bold text-slate-900 tabular-nums">{p.stats?.highestScore || '-'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>* Self-declared</span>
                    <span className="text-amber-400 font-bold group-hover:underline">View Card →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-4 right-4 text-slate-600 hover:text-slate-900 font-mono text-lg"
            >
              &times;
            </button>

            <div className="flex items-center gap-4">
              <div className="w-20 h-24 rounded-lg bg-slate-900 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                {selectedPlayer.photoUrl ? (
                  <img src={selectedPlayer.photoUrl} alt={selectedPlayer.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-mono text-3xl font-extrabold text-slate-600">
                    {selectedPlayer.name?.charAt(0) || 'P'}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 uppercase">
                  {selectedPlayer.academic?.bucket || selectedPlayer.bucket || 'B3'} · {BUCKET_LABELS[(selectedPlayer.academic?.bucket || selectedPlayer.bucket || 'B3') as BucketId]}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {selectedPlayer.name || selectedPlayer.playerName}
                </h2>
                <p className="text-xs font-mono text-slate-600">
                  {selectedPlayer.academic?.program || 'B.Tech'} · {selectedPlayer.academic?.branch || 'ECE'} · Year {selectedPlayer.academic?.studyYear || 3}
                </p>
              </div>
            </div>

            {/* Profile Specifics */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-200 p-4 rounded-xl font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Player Role</span>
                <span className="font-bold text-emerald-400">{selectedPlayer.derived?.playerType || selectedPlayer.playerType || 'BATTER'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Base Auction Price</span>
                <span className="font-bold text-amber-400">{selectedPlayer.basePrice || 50} Credits</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Batting Arm</span>
                <span className="text-slate-200">{selectedPlayer.derived?.battingArm || 'Right Hand'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Bowling Style</span>
                <span className="text-slate-200">{selectedPlayer.derived?.bowlingStyle || 'Right Arm Fast'}</span>
              </div>
            </div>

            {/* Stats Full Grid */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-slate-600 font-bold uppercase">Self-Declared Career Record</span>
                <span className="text-[10px] text-amber-400/80 font-mono">Verified Nominations</span>
              </div>
              <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-200 p-3 rounded-xl text-center text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Matches</div>
                  <div className="font-bold text-slate-900 tabular-nums">{selectedPlayer.stats?.matches || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Total Runs</div>
                  <div className="font-bold text-slate-900 tabular-nums">{selectedPlayer.stats?.runs || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Wickets</div>
                  <div className="font-bold text-slate-900 tabular-nums">{selectedPlayer.stats?.wickets || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Highest</div>
                  <div className="font-bold text-slate-900 tabular-nums">{selectedPlayer.stats?.highestScore || '-'}</div>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-900 font-mono text-xs font-bold rounded-lg transition-colors"
              >
                Close Player Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-[#090e1a] py-4 text-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
        Avanthi Cricket Carnival (ACC 2026) · Public Player Directory
      </footer>
    </div>
  );
}
