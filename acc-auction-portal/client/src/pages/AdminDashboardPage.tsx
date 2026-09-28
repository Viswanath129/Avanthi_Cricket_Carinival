import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { BUCKET_LABELS, type BucketId, type PlayerDoc, type FranchiseDoc } from '@shared/types';

const EDITION_ID = 'acc-2026';

type Tab = 'overview' | 'players' | 'franchises' | 'settings';

export default function AdminDashboardPage() {
  const { user, userDoc, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [players, setPlayers] = useState<(PlayerDoc & { id: string })[]>([]);
  const [franchises, setFranchises] = useState<(FranchiseDoc & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pq = query(collection(db, 'players'), where('editionId', '==', EDITION_ID));
    const unsub1 = onSnapshot(pq, (snap) => {
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() } as PlayerDoc & { id: string })));
      setLoading(false);
    });
    const fq = query(collection(db, 'franchises'), where('editionId', '==', EDITION_ID));
    const unsub2 = onSnapshot(fq, (snap) => {
      setFranchises(snap.docs.map(d => ({ id: d.id, ...d.data() } as FranchiseDoc & { id: string })));
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'players', label: 'Players' },
    { id: 'franchises', label: 'Franchises' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] p-4 sticky top-0 z-10 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="font-display font-bold text-xl tracking-tight text-white">ACC 2026</a>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)] border border-[var(--accent)]/30 px-2 py-0.5 rounded-sm">
              {userDoc?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/admin/auction" className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent)]/80 transition-colors">
              Auction Control
            </a>
            <span className="text-xs text-[var(--muted-foreground)]">{user?.email}</span>
            <button onClick={() => signOut()} className="text-xs text-red-400 font-semibold hover:text-red-300">
              SIGN OUT
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto flex gap-1 px-4 pt-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.id
                  ? 'text-white border-[var(--primary)]'
                  : 'text-[var(--muted-foreground)] border-transparent hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {tab === 'overview' && <OverviewTab players={players} franchises={franchises} loading={loading} />}
        {tab === 'players' && <PlayersTab players={players} loading={loading} />}
        {tab === 'franchises' && <FranchisesTab franchises={franchises} loading={loading} />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

function OverviewTab({ players, franchises, loading }: { players: (PlayerDoc & { id: string })[]; franchises: (FranchiseDoc & { id: string })[]; loading: boolean }) {
  const paid = players.filter(p => p.registration?.paid).length;
  const approved = players.filter(p => p.registration?.status === 'APPROVED').length;
  const auctionable = players.filter(p => p.auctionable).length;
  const approvedFranchises = franchises.filter(f => f.status === 'APPROVED' || f.status === 'ACTIVE').length;

  const buckets: BucketId[] = ['B1', 'B2', 'B3', 'B4', 'D5', 'M6'];
  const bucketCounts = buckets.map(b => ({
    bucket: b,
    count: players.filter(p => p.academic?.bucket === b).length,
    auctionable: players.filter(p => p.academic?.bucket === b && p.auctionable).length,
  }));

  if (loading) return <p className="font-mono text-sm text-[var(--muted-foreground)] py-10 text-center">Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Players" value={players.length} />
        <StatCard label="Paid" value={paid} color="text-green-400" />
        <StatCard label="Approved" value={approved} color="text-green-400" />
        <StatCard label="Auctionable" value={auctionable} color="text-[var(--accent)]" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Franchises" value={franchises.length} />
        <StatCard label="Approved" value={approvedFranchises} color="text-green-400" />
        <StatCard label="Pending" value={franchises.length - approvedFranchises} color="text-yellow-400" />
        <StatCard label="Total Purse" value={`\u20B9${approvedFranchises * 1000}`} />
      </div>

      {/* Bucket Distribution */}
      <div className="border border-[var(--border)] rounded-sm bg-[var(--card)] p-6">
        <h3 className="font-display font-bold text-white mb-4">Bucket Distribution</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {bucketCounts.map(bc => (
            <div key={bc.bucket} className="text-center border border-[var(--border)] rounded-sm p-3">
              <p className="font-mono text-2xl font-bold text-white">{bc.count}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{bc.bucket}</p>
              <p className="text-[10px] text-green-400 mt-1">{bc.auctionable} auctionable</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/admin/auction" className="block border border-[var(--border)] rounded-sm bg-[var(--card)] p-6 hover:border-[var(--accent)] transition-colors">
          <h3 className="font-display font-bold text-[var(--accent)]">Auction Control</h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Run live auction, manage bids, hammer sales</p>
        </a>
        <a href="/projector" className="block border border-[var(--border)] rounded-sm bg-[var(--card)] p-6 hover:border-white/20 transition-colors">
          <h3 className="font-display font-bold text-white">Projector View</h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Fullscreen display for stadium projection</p>
        </a>
        <a href="/live" className="block border border-[var(--border)] rounded-sm bg-[var(--card)] p-6 hover:border-white/20 transition-colors">
          <h3 className="font-display font-bold text-white">Public View</h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">See what spectators see during live auction</p>
        </a>
      </div>
    </div>
  );
}

function PlayersTab({ players, loading }: { players: (PlayerDoc & { id: string })[]; loading: boolean }) {
  const [filter, setFilter] = useState<'ALL' | 'SUBMITTED' | 'APPROVED' | 'UNPAID'>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const markPaymentFn = httpsCallable(functions, 'markPayment');
  const approvePlayerFn = httpsCallable(functions, 'approvePlayer');

  const filtered = players.filter(p => {
    if (filter === 'SUBMITTED') return p.registration?.status === 'SUBMITTED';
    if (filter === 'APPROVED') return p.registration?.status === 'APPROVED';
    if (filter === 'UNPAID') return !p.registration?.paid;
    return true;
  });

  const handleApprove = async (playerId: string) => {
    setActionLoading(playerId);
    try {
      await approvePlayerFn({ playerId, action: 'APPROVE' });
    } catch (e: any) {
      alert(e.message || 'Failed to approve');
    }
    setActionLoading(null);
  };

  const handleMarkPaid = async (playerId: string) => {
    setActionLoading(playerId);
    try {
      await markPaymentFn({ playerId, paid: true });
    } catch (e: any) {
      alert(e.message || 'Failed to mark payment');
    }
    setActionLoading(null);
  };

  if (loading) return <p className="font-mono text-sm text-[var(--muted-foreground)] py-10 text-center">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'SUBMITTED', 'APPROVED', 'UNPAID'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors ${
              filter === f ? 'bg-white text-black border-white' : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-white'
            }`}
          >
            {f === 'ALL' ? `All (${players.length})` : f}
          </button>
        ))}
      </div>

      <div className="border border-[var(--border)] rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--card)]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Roll</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Bucket</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Type</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Base</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Paid</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-[var(--border)] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted-foreground)]">{p.rollNumber}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-sm bg-white/10 text-white">
                      {p.academic?.bucket}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                    {p.derived?.playerType?.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-[var(--primary)]">
                    {'\u20B9'}{p.basePrice}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-bold uppercase ${
                      p.registration?.status === 'APPROVED' ? 'text-green-400' :
                      p.registration?.status === 'SUBMITTED' ? 'text-yellow-400' : 'text-[var(--muted-foreground)]'
                    }`}>
                      {p.registration?.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-bold ${p.registration?.paid ? 'text-green-400' : 'text-red-400'}`}>
                      {p.registration?.paid ? 'YES' : 'NO'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      {p.registration?.status === 'SUBMITTED' && (
                        <button
                          onClick={() => handleApprove(p.id)}
                          disabled={actionLoading === p.id}
                          className="px-2 py-1 text-[10px] font-bold bg-green-500/20 text-green-400 rounded-sm hover:bg-green-500/30 disabled:opacity-50"
                        >
                          {actionLoading === p.id ? '...' : 'APPROVE'}
                        </button>
                      )}
                      {!p.registration?.paid && (
                        <button
                          onClick={() => handleMarkPaid(p.id)}
                          disabled={actionLoading === p.id}
                          className="px-2 py-1 text-[10px] font-bold bg-blue-500/20 text-blue-400 rounded-sm hover:bg-blue-500/30 disabled:opacity-50"
                        >
                          {actionLoading === p.id ? '...' : 'MARK PAID'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-[var(--muted-foreground)] text-sm">No players match this filter.</div>
        )}
      </div>
    </div>
  );
}

function FranchisesTab({ franchises, loading }: { franchises: (FranchiseDoc & { id: string })[]; loading: boolean }) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const approveFranchiseFn = httpsCallable(functions, 'approveFranchise');

  const handleApprove = async (franchiseId: string) => {
    setActionLoading(franchiseId);
    try {
      await approveFranchiseFn({ franchiseId });
    } catch (e: any) {
      alert(e.message || 'Failed to approve');
    }
    setActionLoading(null);
  };

  if (loading) return <p className="font-mono text-sm text-[var(--muted-foreground)] py-10 text-center">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {franchises.map(f => (
          <div key={f.id} className="border border-[var(--border)] rounded-sm bg-[var(--card)] p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display font-bold text-white">{f.name}</h3>
                <p className="font-mono text-[10px] text-[var(--muted-foreground)]">{f.shortName} {'\u00B7'} {f.id}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                f.status === 'APPROVED' || f.status === 'ACTIVE' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {f.status}
              </span>
            </div>

            <div className="space-y-2 text-xs border-t border-[var(--border)] pt-3">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Coordinator</span>
                <span className="text-white">{f.coordinator?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Department</span>
                <span className="text-white">{f.coordinator?.department || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Purse</span>
                <span className="font-mono text-[var(--primary)]">{'\u20B9'}{f.purseRemaining ?? f.purseInitial ?? 1000}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Squad</span>
                <span className="font-mono text-white">{f.squad?.count ?? 0}</span>
              </div>
            </div>

            {/* Bucket fills */}
            <div className="grid grid-cols-6 gap-1 pt-3 mt-3 border-t border-[var(--border)]">
              {(['B1','B2','B3','B4','D5','M6'] as BucketId[]).map(b => {
                const count = f.squad?.bucketCounts?.[b] ?? 0;
                return (
                  <div key={b} className="text-center">
                    <p className={`font-mono text-xs font-bold ${count >= 2 ? 'text-green-400' : 'text-[var(--muted-foreground)]'}`}>{count}</p>
                    <p className="text-[8px] text-[var(--muted-foreground)]">{b}</p>
                  </div>
                );
              })}
            </div>

            {f.status === 'PENDING' && (
              <div className="mt-4 pt-3 border-t border-[var(--border)]">
                <button
                  onClick={() => handleApprove(f.id)}
                  disabled={actionLoading === f.id}
                  className="w-full py-2 text-xs font-bold bg-green-500/20 text-green-400 rounded-sm hover:bg-green-500/30 disabled:opacity-50"
                >
                  {actionLoading === f.id ? 'Approving...' : 'APPROVE FRANCHISE'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {franchises.length === 0 && (
        <div className="text-center py-8 border border-dashed border-[var(--border)] rounded-sm">
          <p className="text-[var(--muted-foreground)]">No franchises registered yet.</p>
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const [generating, setGenerating] = useState(false);
  const generateDrawFn = httpsCallable(functions, 'generateDraw');
  const createEditionFn = httpsCallable(functions, 'createEdition');

  const handleGenerateDraw = async () => {
    setGenerating(true);
    try {
      const result = await generateDrawFn({ editionId: EDITION_ID, round: 1 });
      alert(`Draw generated: ${JSON.stringify(result.data)}`);
    } catch (e: any) {
      alert(e.message || 'Failed to generate draw');
    }
    setGenerating(false);
  };

  const handleCreateEdition = async () => {
    try {
      const result = await createEditionFn({
        name: 'ACC 2026',
        academicYear: '2026-27',
        currentAcademicStartYear: 2026,
      });
      alert(`Edition created: ${JSON.stringify(result.data)}`);
    } catch (e: any) {
      alert(e.message || 'Failed to create edition');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="border border-[var(--border)] rounded-sm bg-[var(--card)] p-6">
        <h3 className="font-display font-bold text-white mb-4">Edition Management</h3>
        <button
          onClick={handleCreateEdition}
          className="px-4 py-2 text-sm font-semibold border border-[var(--border)] text-white rounded-sm hover:bg-white/5"
        >
          Create ACC 2026 Edition
        </button>
      </div>

      <div className="border border-[var(--border)] rounded-sm bg-[var(--card)] p-6">
        <h3 className="font-display font-bold text-white mb-2">Auction Draw</h3>
        <p className="text-xs text-[var(--muted-foreground)] mb-4">
          Generate random draw numbers for all auctionable players. Order: B3, B4, B2, D5, B1, M6.
        </p>
        <button
          onClick={handleGenerateDraw}
          disabled={generating}
          className="px-4 py-2 text-sm font-bold bg-[var(--accent)] text-[var(--accent-foreground)] rounded-sm hover:opacity-90 disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Generate Round 1 Draw'}
        </button>
      </div>

      <div className="border border-[var(--border)] rounded-sm bg-[var(--card)] p-6">
        <h3 className="font-display font-bold text-white mb-2">Bucket Minimums</h3>
        <p className="text-xs text-[var(--muted-foreground)] mb-4">
          Configure mandatory minimum players per bucket for all franchises.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {(['B1','B2','B3','B4','D5','M6'] as BucketId[]).map(b => (
            <div key={b} className="flex items-center justify-between border border-[var(--border)] rounded-sm p-3">
              <span className="text-xs text-white font-semibold">{b}</span>
              <span className="font-mono text-xs text-[var(--muted-foreground)]">
                min: {b === 'M6' ? '0' : '2'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="border border-[var(--border)] rounded-sm bg-[var(--card)] p-4">
      <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-mono text-2xl font-bold ${color || 'text-white'}`}>{value}</p>
    </div>
  );
}
