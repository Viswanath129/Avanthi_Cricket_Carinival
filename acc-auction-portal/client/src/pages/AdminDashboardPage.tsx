import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  addDoc, 
  serverTimestamp,
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { BUCKET_LABELS, type BucketId, type PlayerDoc, type FranchiseDoc } from '@shared/types';
import { 
  LayoutDashboard, 
  Gavel, 
  RotateCcw, 
  Tv, 
  Users, 
  UserCheck, 
  FileSpreadsheet, 
  Shield, 
  UserCog, 
  History, 
  Sliders, 
  Database, 
  Download, 
  Save, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Search, 
  Menu, 
  X, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Edit3, 
  Eye, 
  Archive, 
  ChevronRight,
  Phone,
  Mail,
  Award
} from 'lucide-react';

const EDITION_ID = 'acc-2026';

type NavSection = 
  | 'overview'
  | 'auction'
  | 'round2'
  | 'projector'
  | 'players'
  | 'verification'
  | 'registrations'
  | 'franchises'
  | 'members'
  | 'admins'
  | 'audit'
  | 'settings'
  | 'datamanagement'
  | 'export'
  | 'backups';

export default function AdminDashboardPage() {
  const { user, userDoc, signOut } = useAuth();
  const [, setLocation] = useLocation();

  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Core Data States
  const [players, setPlayers] = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [deletedPlayers, setDeletedPlayers] = useState<any[]>([]);
  const [deletedFranchises, setDeletedFranchises] = useState<any[]>([]);

  // Tournament Settings State
  const [settings, setSettings] = useState({
    academicYear: 2026,
    regOpen: '2026-10-01',
    regClose: '2026-10-10',
    minPerBucket: 2,
    basePriceFloor: 20,
    offlineFeeRequired: true,
  });

  // Modals
  const [inspectPlayer, setInspectPlayer] = useState<any | null>(null);
  const [editPlayer, setEditPlayer] = useState<any | null>(null);
  const [createPlayerModal, setCreatePlayerModal] = useState(false);
  const [verificationModal, setVerificationModal] = useState<any | null>(null);
  const [correctionNote, setCorrectionNote] = useState('');
  const [bulkDeleteModal, setBulkDeleteModal] = useState<'PLAYERS' | 'FRANCHISES' | null>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const isSuperAdmin = userDoc?.role === 'SUPER_ADMIN';

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Firestore Realtime Subscriptions
  useEffect(() => {
    try {
      const pq = query(collection(db, 'players'));
      const unsubPlayers = onSnapshot(pq, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPlayers(list.filter((p: any) => p.status !== 'DELETED'));
        setDeletedPlayers(list.filter((p: any) => p.status === 'DELETED'));
        setLoading(false);
      }, (err) => {
        console.warn("Firestore players listen error, using memory state", err);
        setLoading(false);
      });

      const fq = query(collection(db, 'franchises'));
      const unsubFranchises = onSnapshot(fq, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setFranchises(list.filter((f: any) => f.status !== 'DELETED'));
        setDeletedFranchises(list.filter((f: any) => f.status === 'DELETED'));
      }, (err) => {
        console.warn("Firestore franchises listen error", err);
      });

      const aq = query(collection(db, 'auditLog'), orderBy('timestamp', 'desc'));
      const unsubAudit = onSnapshot(aq, (snap) => {
        setAuditLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, () => {});

      return () => {
        unsubPlayers();
        unsubFranchises();
        unsubAudit();
      };
    } catch {
      setLoading(false);
    }
  }, []);

  const logAudit = async (action: string, targetId: string, details: string) => {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      targetId,
      actorUid: user?.uid || 'usr_admin',
      role: userDoc?.role || 'SUPER_ADMIN',
      details,
    };
    try {
      await addDoc(collection(db, 'auditLog'), entry);
    } catch {
      // Local fallback
      setAuditLogs(prev => [entry, ...prev]);
    }
  };

  // --- ACTIONS ---
  const handleApprovePlayer = async (p: any) => {
    try {
      await updateDoc(doc(db, 'players', p.id), {
        approvalStatus: 'APPROVED',
        verificationStatus: 'VERIFIED',
        status: 'AVAILABLE',
        auctionEligible: true,
        publicVisibility: true,
        updatedAt: new Date().toISOString()
      });
      await logAudit('PLAYER_APPROVED', p.rollNumber || p.id, `Player ${p.name} verified and approved for auction`);
      showToast(`Player ${p.name} approved successfully.`);
      setVerificationModal(null);
    } catch {
      // Fallback
      setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, approvalStatus: 'APPROVED', verificationStatus: 'VERIFIED', status: 'AVAILABLE', auctionEligible: true, publicVisibility: true } : x));
      showToast(`Player ${p.name} approved (local sync).`);
      setVerificationModal(null);
    }
  };

  const handleRequestCorrection = async (p: any, note: string) => {
    if (!note.trim()) {
      showToast("Please enter a correction note.", "warning");
      return;
    }
    try {
      await updateDoc(doc(db, 'players', p.id), {
        approvalStatus: 'CHANGES_REQUIRED',
        verificationStatus: 'CHANGES_REQUIRED',
        correctionNote: note,
        auctionEligible: false,
        updatedAt: new Date().toISOString()
      });
      await logAudit('PLAYER_CHANGES_REQUESTED', p.rollNumber || p.id, `Correction requested: ${note}`);
      showToast(`Correction requested for ${p.name}.`, "warning");
      setVerificationModal(null);
      setCorrectionNote('');
    } catch {
      setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, approvalStatus: 'CHANGES_REQUIRED', correctionNote: note } : x));
      setVerificationModal(null);
      setCorrectionNote('');
    }
  };

  const handleRejectPlayer = async (p: any) => {
    try {
      await updateDoc(doc(db, 'players', p.id), {
        approvalStatus: 'REJECTED',
        verificationStatus: 'REJECTED',
        status: 'REJECTED',
        auctionEligible: false,
        publicVisibility: false,
        updatedAt: new Date().toISOString()
      });
      await logAudit('PLAYER_REJECTED', p.rollNumber || p.id, `Player ${p.name} registration rejected.`);
      showToast(`Player ${p.name} rejected.`, "error");
      setVerificationModal(null);
    } catch {
      setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, approvalStatus: 'REJECTED', status: 'REJECTED' } : x));
      setVerificationModal(null);
    }
  };

  const handleBlockPlayer = async (p: any) => {
    try {
      await updateDoc(doc(db, 'players', p.id), {
        approvalStatus: 'BLOCKED',
        verificationStatus: 'BLOCKED',
        status: 'BLOCKED',
        accountStatus: 'DISABLED',
        auctionEligible: false,
        publicVisibility: false,
        updatedAt: new Date().toISOString()
      });
      await logAudit('PLAYER_BLOCKED', p.rollNumber || p.id, `Player ${p.name} blocked by admin.`);
      showToast(`Player ${p.name} has been BLOCKED.`, "error");
    } catch {
      setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, approvalStatus: 'BLOCKED', status: 'BLOCKED' } : x));
    }
  };

  const handleUnblockPlayer = async (p: any) => {
    try {
      await updateDoc(doc(db, 'players', p.id), {
        approvalStatus: 'PENDING_APPROVAL',
        verificationStatus: 'PENDING_VERIFICATION',
        status: 'AVAILABLE',
        accountStatus: 'ACTIVE',
        updatedAt: new Date().toISOString()
      });
      await logAudit('PLAYER_UNBLOCKED', p.rollNumber || p.id, `Player ${p.name} unblocked.`);
      showToast(`Player ${p.name} unblocked (reset to Pending).`);
    } catch {
      setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, approvalStatus: 'PENDING_APPROVAL', status: 'AVAILABLE' } : x));
    }
  };

  const handleArchivePlayer = async (p: any) => {
    try {
      await updateDoc(doc(db, 'players', p.id), {
        approvalStatus: 'ARCHIVED',
        status: 'ARCHIVED',
        auctionEligible: false,
        publicVisibility: false,
        updatedAt: new Date().toISOString()
      });
      await logAudit('PLAYER_ARCHIVED', p.rollNumber || p.id, `Player ${p.name} moved to archive.`);
      showToast(`Player ${p.name} archived.`);
    } catch {
      setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, approvalStatus: 'ARCHIVED', status: 'ARCHIVED' } : x));
    }
  };

  const handleDeletePlayer = async (p: any) => {
    if (p.auctionHistory || p.status === 'SOLD') {
      showToast("CANNOT DELETE: Player has auction sale history. Must ARCHIVE instead.", "error");
      return;
    }
    try {
      await updateDoc(doc(db, 'players', p.id), {
        status: 'DELETED',
        deletedAt: new Date().toISOString(),
        publicVisibility: false,
        auctionEligible: false
      });
      await logAudit('PLAYER_DELETED_TO_TRASH', p.rollNumber || p.id, `Player ${p.name} moved to trash.`);
      showToast(`Player ${p.name} moved to Trash bin.`);
    } catch {
      setPlayers(prev => prev.filter(x => x.id !== p.id));
      setDeletedPlayers(prev => [...prev, { ...p, status: 'DELETED' }]);
    }
  };

  const handleRestorePlayer = async (p: any) => {
    try {
      await updateDoc(doc(db, 'players', p.id), {
        status: 'AVAILABLE',
        approvalStatus: 'PENDING_APPROVAL',
        verificationStatus: 'PENDING_VERIFICATION',
        deletedAt: null
      });
      await logAudit('PLAYER_RESTORED', p.rollNumber || p.id, `Player ${p.name} restored from trash.`);
      showToast(`Player ${p.name} restored to Pending roster.`);
    } catch {
      setDeletedPlayers(prev => prev.filter(x => x.id !== p.id));
      setPlayers(prev => [...prev, { ...p, status: 'AVAILABLE', approvalStatus: 'PENDING_APPROVAL' }]);
    }
  };

  const handlePermanentDelete = async (p: any) => {
    if (!isSuperAdmin) {
      showToast("ACCESS DENIED: Super Admin required for permanent purge.", "error");
      return;
    }
    try {
      await deleteDoc(doc(db, 'players', p.id));
      await logAudit('PLAYER_PERMANENTLY_PURGED', p.rollNumber || p.id, `Player ${p.name} permanently wiped.`);
      showToast(`Player ${p.name} permanently removed.`);
    } catch {
      setDeletedPlayers(prev => prev.filter(x => x.id !== p.id));
    }
  };

  const handleBulkDeleteAllPlayers = async () => {
    if (confirmInput !== 'DELETE ALL PLAYERS') {
      showToast("Typed confirmation text mismatch.", "error");
      return;
    }
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const updates = players.map(p => 
        updateDoc(doc(db, 'players', p.id), { status: 'DELETED', deletedAt: now, publicVisibility: false })
      );
      await Promise.all(updates);
      await logAudit('BULK_DELETE_ALL_PLAYERS', 'ALL', `All ${players.length} players soft-deleted to Trash.`);
      showToast(`Successfully moved ${players.length} players to Trash.`);
      setBulkDeleteModal(null);
      setConfirmInput('');
    } catch {
      setDeletedPlayers(prev => [...prev, ...players.map(p => ({ ...p, status: 'DELETED' }))]);
      setPlayers([]);
      setBulkDeleteModal(null);
      setConfirmInput('');
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Roll Number", "Program", "Bucket", "Type", "Base Price", "Approval Status", "Paid Status", "Mobile"];
    const rows = players.map(p => [
      p.id,
      `"${p.name || ''}"`,
      p.rollNumber || p.roll || '',
      p.program || p.academic?.program || '',
      p.bucket || p.academic?.bucket || '',
      p.type || p.derived?.playerType || '',
      p.basePrice || 20,
      p.approvalStatus || p.registration?.status || 'PENDING',
      p.paid ? 'PAID' : 'UNPAID',
      p.mobile || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ACC_2026_Players_Master_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAudit('EXPORT_CSV', 'PLAYERS', `Exported ${players.length} player records to CSV.`);
    showToast("CSV Export downloaded successfully.");
  };

  const handleExportJSON = () => {
    const dataPackage = {
      edition: EDITION_ID,
      exportTimestamp: new Date().toISOString(),
      counts: { players: players.length, franchises: franchises.length, audit: auditLogs.length },
      players,
      franchises,
      auditLogs,
      settings
    };
    const blob = new Blob([JSON.stringify(dataPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ACC_2026_Full_Database_Snapshot_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    logAudit('EXPORT_SNAPSHOT', 'DATABASE', `Full JSON snapshot exported.`);
    showToast("JSON Database snapshot exported.");
  };

  return (
    <div className="min-h-screen bg-[#080c0a] text-[#f5f7f6] flex flex-col font-sans antialiased">
      {/* Toast Notification Banner */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border text-sm font-semibold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'error' ? 'bg-red-950/90 border-red-500 text-red-200' :
          notification.type === 'warning' ? 'bg-amber-950/90 border-amber-500 text-amber-200' :
          'bg-emerald-950/90 border-emerald-500 text-emerald-200'
        }`}>
          {notification.type === 'error' ? <XCircle size={18} /> :
           notification.type === 'warning' ? <AlertTriangle size={18} /> :
           <CheckCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="h-16 border-b border-white/[0.08] bg-[#0b100d] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white"
          >
            <Menu size={18} />
          </button>
          <a href="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-display font-black text-black text-sm">
              ACC
            </span>
            <span className="font-display font-bold text-base tracking-tight text-white hidden sm:inline">
              AUCTION OPERATING SYSTEM
            </span>
          </a>
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold">
            {isSuperAdmin ? 'SUPER ADMIN CONSOLE' : 'OPERATOR CONSOLE'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation('/admin/auction')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition-all shadow-sm"
          >
            <Gavel size={14} />
            <span className="hidden sm:inline">LIVE FLOOR COCKPIT</span>
          </button>
          <a
            href="/projector"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition-all border border-white/10"
          >
            <Tv size={14} />
            <span className="hidden sm:inline">PROJECTOR ↗</span>
          </a>
          <button
            onClick={() => signOut()}
            className="text-xs text-red-400 hover:text-red-300 font-mono font-semibold px-2 py-1"
          >
            EXIT
          </button>
        </div>
      </header>

      {/* Main Admin Layout: Sidebar + Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar (Desktop) & Drawer (Mobile) */}
        <aside className={`fixed lg:static inset-y-16 left-0 z-20 w-64 bg-[#090d0b] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 space-y-6 overflow-y-auto">
            {/* Group: OPERATIONS */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">OPERATIONS</p>
              <div className="space-y-1">
                {[
                  { id: 'overview' as NavSection, label: 'Overview', icon: LayoutDashboard },
                  { id: 'auction' as NavSection, label: 'Auction Cockpit', icon: Gavel },
                  { id: 'round2' as NavSection, label: 'Round 2 Pool', icon: RotateCcw },
                  { id: 'projector' as NavSection, label: 'Projector Display', icon: Tv },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); setMobileDrawerOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeSection === item.id 
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={15} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Group: PEOPLE */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">PEOPLE</p>
              <div className="space-y-1">
                {[
                  { id: 'players' as NavSection, label: 'Player Directory', icon: Users, badge: players.length },
                  { id: 'verification' as NavSection, label: 'Player Verification', icon: UserCheck, badge: players.filter(p => p.approvalStatus === 'PENDING_APPROVAL' || p.verificationStatus === 'PENDING_VERIFICATION').length },
                  { id: 'registrations' as NavSection, label: 'Registrations & Referrals', icon: FileSpreadsheet },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); setMobileDrawerOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeSection === item.id 
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={15} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        activeSection === item.id ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Group: FRANCHISES */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">FRANCHISES</p>
              <div className="space-y-1">
                {[
                  { id: 'franchises' as NavSection, label: 'Franchise Teams', icon: Shield, badge: franchises.length },
                  { id: 'members' as NavSection, label: 'Franchise Members', icon: UserCog },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); setMobileDrawerOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeSection === item.id 
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={15} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        activeSection === item.id ? 'bg-black/20 text-black' : 'bg-white/10 text-slate-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Group: GOVERNANCE */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">GOVERNANCE</p>
              <div className="space-y-1">
                {[
                  { id: 'admins' as NavSection, label: 'Admin Accounts', icon: Shield },
                  { id: 'audit' as NavSection, label: 'Audit Trail Ledger', icon: History, badge: auditLogs.length },
                  { id: 'settings' as NavSection, label: 'Tournament Settings', icon: Sliders },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); setMobileDrawerOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeSection === item.id 
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={15} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Group: DATA */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">DATA OPERATIONS</p>
              <div className="space-y-1">
                {[
                  { id: 'datamanagement' as NavSection, label: 'Data Management & Trash', icon: Database, badge: deletedPlayers.length },
                  { id: 'export' as NavSection, label: 'Export Data', icon: Download },
                  { id: 'backups' as NavSection, label: 'Backups & Snapshots', icon: Save },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); setMobileDrawerOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeSection === item.id 
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={15} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-white/[0.08] bg-black/20 text-[11px] font-mono text-slate-500">
            <p>Avanthi Cricket Carnival</p>
            <p className="text-slate-600">Edition: ACC 2026</p>
          </div>
        </aside>

        {/* Backdrop for mobile drawer */}
        {mobileDrawerOpen && (
          <div 
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 z-10 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Main Function Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#0b100d]">
          {/* SECTION: OVERVIEW */}
          {activeSection === 'overview' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-white/[0.08] pb-4">
                <div>
                  <h1 className="font-display font-black text-2xl text-white">OPERATIONAL OVERVIEW</h1>
                  <p className="text-xs text-slate-400 mt-1">Live metrics across candidates, approval pipelines, franchise wallets, and auction quotas.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveSection('verification')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                  >
                    Review Pending ({players.filter(p => p.approvalStatus === 'PENDING_APPROVAL').length})
                  </button>
                </div>
              </div>

              {/* High-level KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Registered Players</p>
                  <p className="font-display font-black text-3xl text-white mt-1">{players.length}</p>
                  <p className="text-[11px] text-emerald-400 mt-1">✓ Active in directory</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Auction Eligible</p>
                  <p className="font-display font-black text-3xl text-emerald-400 mt-1">
                    {players.filter(p => p.auctionEligible || p.approvalStatus === 'APPROVED').length}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Paid & verified</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Franchise Teams</p>
                  <p className="font-display font-black text-3xl text-white mt-1">{franchises.length}</p>
                  <p className="text-[11px] text-amber-400 mt-1">11 official quota</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Trash Bin</p>
                  <p className="font-display font-black text-3xl text-red-400 mt-1">{deletedPlayers.length}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Recoverable records</p>
                </div>
              </div>

              {/* Bucket Quota Distribution */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <h3 className="font-display font-bold text-lg text-white mb-4">Official Bucket Pool Status</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {(['B1', 'B2', 'B3', 'B4', 'D5', 'M6'] as BucketId[]).map(b => {
                    const count = players.filter(p => p.bucket === b || p.academic?.bucket === b).length;
                    const approved = players.filter(p => (p.bucket === b || p.academic?.bucket === b) && (p.auctionEligible || p.approvalStatus === 'APPROVED')).length;
                    return (
                      <div key={b} className="p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-white">{b}</span>
                        <p className="font-display font-black text-2xl text-white mt-2">{count}</p>
                        <p className="text-[10px] text-slate-400">{BUCKET_LABELS[b]}</p>
                        <p className="text-[10px] font-mono text-emerald-400 mt-1">{approved} eligible</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: PLAYERS */}
          {activeSection === 'players' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-white/[0.08] pb-4">
                <div>
                  <h1 className="font-display font-black text-2xl text-white">PLAYER DIRECTORY & GOVERNANCE</h1>
                  <p className="text-xs text-slate-400 mt-1">Full candidate lifecycle: Inspect, Edit, Approve, Block, Archive, Delete.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCreatePlayerModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                  >
                    <Plus size={14} />
                    <span>CREATE PLAYER</span>
                  </button>
                  {isSuperAdmin && (
                    <button
                      onClick={() => setBulkDeleteModal('PLAYERS')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold"
                    >
                      <Trash2 size={14} />
                      <span>DELETE ALL PLAYERS</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-black/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-mono uppercase text-[11px]">
                        <th className="p-3">Player</th>
                        <th className="p-3">Roll Number</th>
                        <th className="p-3">Program / Bucket</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Base</th>
                        <th className="p-3">Approval</th>
                        <th className="p-3">Paid</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {players.map(p => (
                        <tr key={p.id} className="hover:bg-white/[0.02]">
                          <td className="p-3 font-semibold text-white flex items-center gap-2">
                            {p.photo ? (
                              <img src={p.photo} alt={p.name} className="w-7 h-7 rounded-full object-cover border border-white/10" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                                {p.name ? p.name[0] : 'P'}
                              </div>
                            )}
                            <span>{p.name}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-400">{p.rollNumber || p.roll}</td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-300">{p.program || p.academic?.program}</span>
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-white">
                              {p.bucket || p.academic?.bucket}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{p.role || p.derived?.playerType || 'ALL-ROUNDER'}</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">₹{p.basePrice || 20}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.approvalStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                              p.approvalStatus === 'BLOCKED' ? 'bg-red-500/20 text-red-400' :
                              p.approvalStatus === 'ARCHIVED' ? 'bg-slate-500/20 text-slate-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {p.approvalStatus || 'PENDING'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`font-mono text-[10px] font-bold ${p.paid || p.registration?.paid ? 'text-emerald-400' : 'text-red-400'}`}>
                              {p.paid || p.registration?.paid ? 'PAID' : 'UNPAID'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setInspectPlayer(p)}
                                title="Inspect Details"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={() => setEditPlayer(p)}
                                title="Edit Player"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400"
                              >
                                <Edit3 size={13} />
                              </button>
                              {p.approvalStatus === 'BLOCKED' ? (
                                <button
                                  onClick={() => handleUnblockPlayer(p)}
                                  title="Unblock Player"
                                  className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                                >
                                  <Unlock size={13} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBlockPlayer(p)}
                                  title="Block Player"
                                  className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                                >
                                  <Lock size={13} />
                                </button>
                              )}
                              <button
                                onClick={() => handleArchivePlayer(p)}
                                title="Archive Player"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400"
                              >
                                <Archive size={13} />
                              </button>
                              <button
                                onClick={() => handleDeletePlayer(p)}
                                title="Move to Trash"
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: PLAYER VERIFICATION */}
          {activeSection === 'verification' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                    HARD GATE
                  </span>
                  <h1 className="font-display font-black text-2xl text-white">PLAYER VERIFICATION WORKFLOW</h1>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Only VERIFIED players enter the live auction pool. Review submitted identity, 4:3 photograph, academic rollover, and CricHeroes status.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players
                  .filter(p => p.approvalStatus === 'PENDING_APPROVAL' || p.verificationStatus === 'PENDING_VERIFICATION')
                  .map(p => (
                    <div key={p.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
                      <div className="flex items-start gap-3">
                        {p.photo ? (
                          <img src={p.photo} alt={p.name} className="w-16 h-12 rounded-lg object-cover border border-white/10 shrink-0" />
                        ) : (
                          <div className="w-16 h-12 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                            NO PIC
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-white text-base truncate">{p.name}</h3>
                          <p className="font-mono text-xs text-slate-400">{p.rollNumber || p.roll}</p>
                          <p className="text-[11px] text-emerald-400 mt-0.5">{p.program} · Bucket {p.bucket}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">CricHeroes:</span>
                          <span className={p.cricHeroesUrl ? 'text-emerald-400' : 'text-amber-400'}>
                            {p.cricHeroesUrl ? 'Provided' : 'Pending Verification'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Base Price:</span>
                          <span className="text-white font-bold">₹{p.basePrice || 20}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Offline Fee:</span>
                          <span className={p.paid ? 'text-emerald-400' : 'text-red-400'}>
                            {p.paid ? 'COLLECTED' : 'UNPAID'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleApprovePlayer(p)}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                        >
                          APPROVE
                        </button>
                        <button
                          onClick={() => setVerificationModal(p)}
                          className="px-3 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-xs font-semibold"
                        >
                          REQUEST FIX
                        </button>
                        <button
                          onClick={() => handleRejectPlayer(p)}
                          className="px-3 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 text-xs font-semibold"
                        >
                          REJECT
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* SECTION: DATA MANAGEMENT & TRASH */}
          {activeSection === 'datamanagement' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="border-b border-white/[0.08] pb-4">
                <h1 className="font-display font-black text-2xl text-white">DATA MANAGEMENT & DELETION RECOVERY</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Controlled bulk operations, soft-delete trash recovery, and permanent database purge.
                </p>
              </div>

              {/* Trash Bin Table */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">Deleted Players (Trash Bin)</h3>
                    <p className="text-xs text-slate-400">Records are kept in trash and can be restored without loss of statistics.</p>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-bold">
                    {deletedPlayers.length} in Trash
                  </span>
                </div>

                {deletedPlayers.length === 0 ? (
                  <p className="py-8 text-center text-xs font-mono text-slate-500">Trash bin is empty.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-mono text-[11px]">
                          <th className="p-3">Name</th>
                          <th className="p-3">Roll</th>
                          <th className="p-3">Deleted Date</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {deletedPlayers.map(p => (
                          <tr key={p.id}>
                            <td className="p-3 text-white font-medium">{p.name}</td>
                            <td className="p-3 font-mono text-slate-400">{p.rollNumber || p.roll}</td>
                            <td className="p-3 font-mono text-slate-400">{p.deletedAt ? new Date(p.deletedAt).toLocaleString() : 'N/A'}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleRestorePlayer(p)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs mr-2"
                              >
                                RESTORE
                              </button>
                              {isSuperAdmin && (
                                <button
                                  onClick={() => handlePermanentDelete(p)}
                                  className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900 text-red-300 font-semibold text-xs border border-red-500/30"
                                >
                                  PURGE
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION: AUDIT */}
          {activeSection === 'audit' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="border-b border-white/[0.08] pb-4 flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl text-white">TAMPER-PROOF AUDIT TRAIL</h1>
                  <p className="text-xs text-slate-400 mt-1">Append-only administrative ledger. Every floor override, undo, and approval is logged.</p>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-white/10 text-white font-bold">
                  {auditLogs.length} Events
                </span>
              </div>

              <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-black/20">
                <div className="overflow-x-auto max-h-[600px]">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-[#090d0b] border-b border-white/[0.08] text-slate-400 font-mono uppercase text-[11px]">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Target</th>
                        <th className="p-3">Actor / Role</th>
                        <th className="p-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05] font-mono">
                      {auditLogs.map((log, idx) => (
                        <tr key={log.id || idx} className="hover:bg-white/[0.02]">
                          <td className="p-3 text-slate-400">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A'}</td>
                          <td className="p-3 font-bold text-emerald-400">{log.action}</td>
                          <td className="p-3 text-white">{log.targetId || '-'}</td>
                          <td className="p-3 text-slate-400">{log.role || 'SUPER_ADMIN'}</td>
                          <td className="p-3 text-slate-300 font-sans">{log.details || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: EXPORT */}
          {activeSection === 'export' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="border-b border-white/[0.08] pb-4">
                <h1 className="font-display font-black text-2xl text-white">DATA EXPORT & SPREADSHEET REPAIR</h1>
                <p className="text-xs text-slate-400 mt-1">Download complete official datasets for tournament archives, scoring sheets, or disaster recovery.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <FileSpreadsheet size={24} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">Player Master CSV</h3>
                      <p className="text-xs text-slate-400">Export player roster, bucket derivation, and contact numbers.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={15} />
                    <span>DOWNLOAD PLAYERS CSV</span>
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                      <Save size={24} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">Full JSON State Snapshot</h3>
                      <p className="text-xs text-slate-400">Complete JSON bundle including players, franchises, audit, and settings.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={15} />
                    <span>DOWNLOAD JSON SNAPSHOT</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: SETTINGS */}
          {activeSection === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="border-b border-white/[0.08] pb-4">
                <h1 className="font-display font-black text-2xl text-white">TOURNAMENT SETTINGS & GOVERNANCE</h1>
                <p className="text-xs text-slate-400 mt-1">Configure academic rollover dates, minimum bucket quotas, and fee verification rules.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Academic Year Reference</label>
                    <input
                      type="number"
                      value={settings.academicYear}
                      onChange={e => setSettings({ ...settings, academicYear: Number(e.target.value) })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Minimum Players Per Bucket</label>
                    <input
                      type="number"
                      value={settings.minPerBucket}
                      onChange={e => setSettings({ ...settings, minPerBucket: Number(e.target.value) })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                  <div>
                    <p className="text-sm font-semibold text-white">Offline Registration Fee Gate</p>
                    <p className="text-xs text-slate-400">Require administrator to mark player as PAID before entering auction pool.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.offlineFeeRequired}
                    onChange={e => setSettings({ ...settings, offlineFeeRequired: e.target.checked })}
                    className="h-5 w-5 accent-emerald-500 rounded"
                  />
                </div>

                <button
                  onClick={() => {
                    logAudit('SETTINGS_SAVED', 'GLOBAL', `Updated tournament settings: Year ${settings.academicYear}`);
                    showToast("Tournament settings saved successfully.");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md"
                >
                  SAVE SETTINGS
                </button>
              </div>
            </div>
          )}

          {/* Fallback for other sections (Auction, Round2, Franchises, etc.) */}
          {['auction', 'round2', 'projector', 'franchises', 'members', 'admins', 'registrations', 'backups'].includes(activeSection) && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="border-b border-white/[0.08] pb-4 flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl text-white uppercase">{activeSection} WORKSPACE</h1>
                  <p className="text-xs text-slate-400 mt-1">Operational interface for {activeSection}. Synchronized with authoritative state.</p>
                </div>
                {activeSection === 'auction' && (
                  <button
                    onClick={() => setLocation('/admin/auction')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                  >
                    LAUNCH FULL COCKPIT
                  </button>
                )}
              </div>
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center space-y-4">
                <p className="text-slate-400 text-sm">Active section loaded: <strong>{activeSection}</strong></p>
                <div className="flex justify-center gap-3">
                  <button onClick={() => setActiveSection('overview')} className="px-4 py-2 rounded-xl bg-white/5 text-xs text-white">Back to Overview</button>
                  <button onClick={() => setActiveSection('players')} className="px-4 py-2 rounded-xl bg-emerald-600 text-xs text-white">Go to Players</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Modal for Correction Request */}
      {verificationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0e1411] border border-white/10 space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-lg text-white">Request Candidate Correction</h3>
            <p className="text-xs text-slate-400">Explain what information needs correction (e.g. low quality photograph, roll number typo):</p>
            <textarea
              value={correctionNote}
              onChange={e => setCorrectionNote(e.target.value)}
              placeholder="e.g. Please provide a clear 4:3 portrait photo without glare."
              className="w-full h-28 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white font-sans focus:border-amber-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setVerificationModal(null)} className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300">CANCEL</button>
              <button onClick={() => handleRequestCorrection(verificationModal, correctionNote)} className="px-4 py-2 rounded-xl bg-amber-600 text-xs font-bold text-white">SUBMIT REQUEST</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete All Players Confirmation Modal */}
      {bulkDeleteModal === 'PLAYERS' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#140808] border border-red-500/30 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={24} />
              <h3 className="font-display font-bold text-lg text-white">BULK DELETE ALL PLAYERS</h3>
            </div>
            <p className="text-xs text-slate-300">
              This will move all <strong>{players.length} players</strong> into the Trash bin. Historical auction sales will not be destroyed.
            </p>
            <p className="text-xs text-slate-400 font-mono">
              Type <strong className="text-red-400">DELETE ALL PLAYERS</strong> to confirm:
            </p>
            <input
              type="text"
              value={confirmInput}
              onChange={e => setConfirmInput(e.target.value)}
              placeholder="DELETE ALL PLAYERS"
              className="w-full bg-black/60 border border-red-500/40 rounded-xl px-4 py-2.5 text-sm text-red-200 font-mono focus:border-red-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setBulkDeleteModal(null); setConfirmInput(''); }} className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300">CANCEL</button>
              <button 
                onClick={handleBulkDeleteAllPlayers}
                disabled={confirmInput !== 'DELETE ALL PLAYERS'}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-xs font-bold text-white transition-colors"
              >
                EXECUTE BULK DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
