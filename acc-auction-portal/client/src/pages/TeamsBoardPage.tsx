import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BUCKET_LABELS, type BucketId, type FranchiseDoc } from '@shared/types';

const EDITION_ID = 'acc-2026';

const BUCKET_IDS: BucketId[] = ['B1', 'B2', 'B3', 'B4', 'D5', 'M6'];

export default function TeamsBoardPage() {
  const [franchises, setFranchises] = useState<(FranchiseDoc & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFranchise, setSelectedFranchise] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'franchises'),
      where('editionId', '==', EDITION_ID)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as FranchiseDoc & { id: string }));
      setFranchises(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const selected = selectedFranchise ? franchises.find(f => f.id === selectedFranchise) : null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--background)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <a href="/" className="font-display font-bold text-xl tracking-tight text-white">ACC 2026</a>
          <nav className="flex gap-6 font-medium text-sm text-[var(--muted-foreground)]">
            <a href="/players" className="hover:text-white transition-colors">Players</a>
            <a href="/teams" className="text-white">Teams</a>
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
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Franchise Teams</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {loading ? 'Loading...' : `${franchises.length} franchises registered`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="font-mono text-sm text-[var(--muted-foreground)]">Loading franchises...</p>
          </div>
        ) : franchises.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--border)] rounded-sm">
            <p className="text-[var(--muted-foreground)]">No franchises registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Franchise List */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {franchises.map(franchise => (
                <FranchiseCard
                  key={franchise.id}
                  franchise={franchise}
                  isSelected={selectedFranchise === franchise.id}
                  onClick={() => setSelectedFranchise(franchise.id === selectedFranchise ? null : franchise.id)}
                />
              ))}
            </div>

            {/* Detail Panel */}
            <div className="lg:col-span-1">
              {selected ? (
                <FranchiseDetail franchise={selected} />
              ) : (
                <div className="border border-dashed border-[var(--border)] rounded-sm p-8 text-center">
                  <p className="text-[var(--muted-foreground)] text-sm">
                    Select a franchise to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function FranchiseCard({
  franchise,
  isSelected,
  onClick,
}: {
  franchise: FranchiseDoc & { id: string };
  isSelected: boolean;
  onClick: () => void;
}) {
  const statusColor = franchise.status === 'ACTIVE' || franchise.status === 'APPROVED'
    ? 'text-green-400'
    : franchise.status === 'PENDING'
    ? 'text-yellow-400'
    : 'text-[var(--muted-foreground)]';

  return (
    <button
      onClick={onClick}
      className={`text-left w-full border rounded-sm bg-[var(--card)] p-4 transition-colors ${
        isSelected
          ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]'
          : 'border-[var(--border)] hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-bold text-white text-base">{franchise.name}</h3>
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">
            {franchise.shortName}
          </span>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
          {franchise.status}
        </span>
      </div>

      {/* Purse */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[var(--muted-foreground)]">Purse</span>
        <span className="font-mono font-bold text-sm text-[var(--primary)]">
          {'\u20B9'}{franchise.purseRemaining ?? franchise.purseInitial ?? 1000}
        </span>
      </div>

      {/* Squad */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[var(--muted-foreground)]">Squad</span>
        <span className="font-mono text-sm text-white">
          {franchise.squad?.count ?? 0} players
        </span>
      </div>

      {/* Bucket Summary */}
      <div className="grid grid-cols-6 gap-1 pt-2 border-t border-[var(--border)]">
        {BUCKET_IDS.map(b => {
          const count = franchise.squad?.bucketCounts?.[b] ?? 0;
          const met = count >= 2;
          return (
            <div key={b} className="text-center">
              <p className={`font-mono text-xs font-bold ${met ? 'text-green-400' : 'text-[var(--muted-foreground)]'}`}>
                {count}
              </p>
              <p className="text-[8px] text-[var(--muted-foreground)]">{b}</p>
            </div>
          );
        })}
      </div>
    </button>
  );
}

function FranchiseDetail({ franchise }: { franchise: FranchiseDoc & { id: string } }) {
  return (
    <div className="border border-[var(--border)] rounded-sm bg-[var(--card)] p-6 space-y-6 sticky top-24">
      {/* Logo */}
      {franchise.logoUrl && (
        <div className="h-32 bg-[var(--muted)] rounded-sm overflow-hidden">
          <img src={franchise.logoUrl} alt={franchise.name} className="w-full h-full object-contain p-4" />
        </div>
      )}

      {/* Name */}
      <div>
        <h2 className="font-display text-xl font-bold text-white">{franchise.name}</h2>
        <p className="font-mono text-xs text-[var(--muted-foreground)] uppercase">{franchise.shortName}</p>
      </div>

      {/* Coordinator */}
      <div className="border-t border-[var(--border)] pt-4">
        <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Faculty Coordinator
        </h3>
        <p className="text-sm text-white font-medium">{franchise.coordinator?.name || 'Not assigned'}</p>
        <p className="text-xs text-[var(--muted-foreground)]">{franchise.coordinator?.department}</p>
      </div>

      {/* Purse & Squad */}
      <div className="border-t border-[var(--border)] pt-4">
        <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
          Purse & Squad
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">Initial Purse</span>
            <span className="font-mono text-xs text-white">{'\u20B9'}{franchise.purseInitial ?? 1000}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">Remaining</span>
            <span className="font-mono text-xs font-bold text-[var(--primary)]">
              {'\u20B9'}{franchise.purseRemaining ?? franchise.purseInitial ?? 1000}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">Squad Size</span>
            <span className="font-mono text-xs text-white">{franchise.squad?.count ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">Auction Purchases</span>
            <span className="font-mono text-xs text-white">{franchise.squad?.auctionPurchases ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">Referrals</span>
            <span className="font-mono text-xs text-white">{franchise.squad?.referredCount ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Bucket Breakdown */}
      <div className="border-t border-[var(--border)] pt-4">
        <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
          Bucket Requirements
        </h3>
        <div className="space-y-2">
          {BUCKET_IDS.map(b => {
            const count = franchise.squad?.bucketCounts?.[b] ?? 0;
            const min = b === 'M6' ? 0 : 2;
            const met = count >= min;
            return (
              <div key={b} className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)]">
                  {b} {'\u2014'} {BUCKET_LABELS[b]}
                </span>
                <span className={`font-mono text-xs font-bold ${met ? 'text-green-400' : 'text-yellow-400'}`}>
                  {count} / {min}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
