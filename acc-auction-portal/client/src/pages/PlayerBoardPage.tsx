import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BUCKET_LABELS, type BucketId, type PlayerPublicDoc } from '@shared/types';

const EDITION_ID = 'acc-2026';

const BUCKET_COLORS: Record<BucketId, string> = {
  B1: '#22c55e',
  B2: '#3b82f6',
  B3: '#a855f7',
  B4: '#f97316',
  D5: '#eab308',
  M6: '#ec4899',
};

export default function PlayerBoardPage() {
  const [players, setPlayers] = useState<(PlayerPublicDoc & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bucketFilter, setBucketFilter] = useState<BucketId | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    const q = query(
      collection(db, 'playersPublic'),
      where('editionId', '==', EDITION_ID)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as PlayerPublicDoc & { id: string }));
      setPlayers(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filteredPlayers = players.filter(p => {
    if (bucketFilter !== 'ALL' && p.academic?.bucket !== bucketFilter) return false;
    if (typeFilter !== 'ALL' && p.derived?.playerType !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!p.name?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const playerTypes = ['ALL', 'WK_BATTER', 'WK', 'ALL_ROUNDER', 'BATTER', 'BOWLER', 'FIELDER'];
  const bucketOptions: (BucketId | 'ALL')[] = ['ALL', 'B1', 'B2', 'B3', 'B4', 'D5', 'M6'];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--background)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <a href="/" className="font-display font-bold text-xl tracking-tight text-white">ACC 2026</a>
          <nav className="flex gap-6 font-medium text-sm text-[var(--muted-foreground)]">
            <a href="/players" className="text-white">Players</a>
            <a href="/teams" className="hover:text-white transition-colors">Teams</a>
            <a href="/live" className="hover:text-white transition-colors">Live Auction</a>
          </nav>
          <a href="/login">
            <button className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-sm font-semibold text-sm">
              LOGIN
            </button>
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Registered Players</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {loading ? 'Loading...' : `${filteredPlayers.length} of ${players.length} players`}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-sm px-4 py-2.5 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />

          {/* Bucket Filter */}
          <div className="flex flex-wrap gap-2">
            {bucketOptions.map(b => (
              <button
                key={b}
                onClick={() => setBucketFilter(b)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors ${
                  bucketFilter === b
                    ? 'bg-white text-black border-white'
                    : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-white hover:border-white/30'
                }`}
              >
                {b === 'ALL' ? 'All Buckets' : `${b} \u2014 ${BUCKET_LABELS[b]}`}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            {playerTypes.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors ${
                  typeFilter === t
                    ? 'bg-white text-black border-white'
                    : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-white hover:border-white/30'
                }`}
              >
                {t === 'ALL' ? 'All Types' : t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Players Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="font-mono text-sm text-[var(--muted-foreground)]">Loading players...</p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--border)] rounded-sm">
            <p className="text-[var(--muted-foreground)] mb-2">No players found</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {players.length === 0 ? 'No players have registered yet.' : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPlayers.map(player => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PlayerCard({ player }: { player: PlayerPublicDoc & { id: string } }) {
  const bucket = player.academic?.bucket as BucketId;
  const bucketColor = BUCKET_COLORS[bucket] || '#888';

  return (
    <div className="border border-[var(--border)] rounded-sm bg-[var(--card)] overflow-hidden hover:border-white/20 transition-colors">
      {/* Photo */}
      {player.photoUrl ? (
        <div className="h-48 bg-[var(--muted)] overflow-hidden">
          <img
            src={player.photoUrl}
            alt={player.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-48 bg-[var(--muted)] flex items-center justify-center">
          <span className="font-display text-4xl font-bold text-[var(--muted-foreground)]">
            {player.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
      )}

      {/* Info */}
      <div className="p-4 space-y-3">
        {/* Name + Bucket */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-white text-sm leading-tight">{player.name}</h3>
          <span
            className="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-sm text-black"
            style={{ backgroundColor: bucketColor }}
          >
            {bucket}
          </span>
        </div>

        {/* Academic */}
        <div className="space-y-1">
          <p className="text-xs text-[var(--muted-foreground)]">
            {player.academic?.branch} \u2014 Year {player.academic?.studyYear}
          </p>
          <p className="text-xs font-semibold" style={{ color: bucketColor }}>
            {BUCKET_LABELS[bucket]}
          </p>
        </div>

        {/* Player Type */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--muted-foreground)]">
            {player.derived?.playerType?.replace(/_/g, ' ') || 'Unknown'}
          </span>
          <span className="font-mono font-bold text-sm text-[var(--primary)]">
            {'\u20B9'}{player.basePrice}
          </span>
        </div>

        {/* Stats */}
        {player.stats && (
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[var(--border)]">
            <StatCell label="Runs" value={player.stats.runs} />
            <StatCell label="Wkts" value={player.stats.wickets} />
            <StatCell label="SR" value={player.stats.strikeRate} />
            <StatCell label="Ct" value={player.stats.catches} />
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            player.auctionable ? 'text-green-400' : 'text-[var(--muted-foreground)]'
          }`}>
            {player.auctionable ? 'Auctionable' : player.registration?.status || 'Pending'}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            player.registration?.paid ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {player.registration?.paid ? 'Paid' : 'Unpaid'}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="font-mono text-xs font-bold text-white">{value || 0}</p>
      <p className="text-[9px] text-[var(--muted-foreground)] uppercase">{label}</p>
    </div>
  );
}
