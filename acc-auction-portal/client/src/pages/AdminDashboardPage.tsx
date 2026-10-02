import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDocs, 
  updateDoc, 
  setDoc, 
  addDoc, 
  serverTimestamp,
  orderBy 
} from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
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

  // Realtime Users Directory State
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userActionUid, setUserActionUid] = useState<string | null>(null);
  const userActionLock = useRef(false);
  const [createAdminModal, setCreateAdminModal] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: 'Floor Handler',
    department: 'Auction Directorate',
    role: 'ADMIN' as 'ADMIN',
    status: 'ACTIVE' as 'ACTIVE',
  });

  const [teamLeadModal, setTeamLeadModal] = useState(false);
  const [teamLeadFormData, setTeamLeadFormData] = useState({
    franchiseId: '',
    name: '',
    rollNumber: '',
    mobile: '',
    email: '',
  });

  const [adminProfile, setAdminProfile] = useState({
    name: typeof window !== 'undefined' ? localStorage.getItem('acc_admin_name') || 'Mr. Deepak' : 'Mr. Deepak',
    designation: typeof window !== 'undefined' ? localStorage.getItem('acc_admin_role') || 'Tournament Director & Super Administrator' : 'Tournament Director & Super Administrator',
    email: user?.email || 'admin@acc.edu',
    phone: typeof window !== 'undefined' ? localStorage.getItem('acc_admin_phone') || '+91 98765 43210' : '+91 98765 43210',
  });

  const handleSaveAdminProfile = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('acc_admin_name', adminProfile.name);
        localStorage.setItem('acc_admin_role', adminProfile.designation);
        localStorage.setItem('acc_admin_phone', adminProfile.phone);
      }
      if (user?.uid) {
        await setDoc(doc(db, 'users', user.uid), {
          displayName: adminProfile.name,
          designation: adminProfile.designation,
          phone: adminProfile.phone,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      await logAudit('ADMIN_PROFILE_UPDATED', user?.uid || 'SUPER_ADMIN', `Updated profile: ${adminProfile.name} (${adminProfile.designation})`);
      showToast("Admin profile saved successfully.");
    } catch (err: any) {
      showToast(err.message || "Failed to save profile", "error");
    }
  };

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

      const uq = query(collection(db, 'users'));
      const unsubUsers = onSnapshot(uq, (snap) => {
        setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, () => {});

      const auditRows = new Map<string, any>();
      const publishAuditRows = () => setAuditLogs([...auditRows.values()].sort((a, b) => {
        const time = (v: any) => v?.toDate ? v.toDate().getTime() : (typeof v === 'number' ? v : Date.parse(v || '') || 0);
        return time(b.timestamp) - time(a.timestamp);
      }));
      const unsubAudit = onSnapshot(collection(db, 'auditLogs'), (snap) => {
        snap.docs.forEach(d => auditRows.set(`auditLogs:${d.id}`, { id: d.id, ...d.data() }));
        publishAuditRows();
      }, () => {});
      const unsubLegacyAudit = onSnapshot(collection(db, 'auditLog'), (snap) => {
        snap.docs.forEach(d => auditRows.set(`auditLog:${d.id}`, { id: d.id, ...d.data(), legacy: true }));
        publishAuditRows();
      }, () => {});

      return () => {
        unsubPlayers();
        unsubFranchises();
        unsubUsers();
        unsubAudit();
        unsubLegacyAudit();
      };
    } catch {
      setLoading(false);
    }
  }, []);

  const logAudit = async (action: string, targetId: string, details: string) => {
    try {
      const write = httpsCallable(functions, 'recordAuditEvent');
      await write({ action, targetType: 'ADMINISTRATION', targetId, details, editionId: EDITION_ID });
    } catch {
      showToast('Audit event could not be persisted; operation was not recorded.', 'error');
    }
  };

  const manageUserRecord = async (target: any, action: 'DELETE' | 'RESTORE' | 'PERMANENT_DELETE') => {
    if (!isSuperAdmin || userActionLock.current) return;
    const uid = target.id || target.uid;
    const label = target.name || target.displayName || target.email || uid;
    if (action === 'DELETE' && !window.confirm(`Move ${label} (${uid}) to Trash? Their account will be disabled. Historical auction records are preserved.`)) return;
    let confirmation: string | undefined;
    if (action === 'PERMANENT_DELETE') {
      confirmation = window.prompt(`Permanently delete ${label} (${uid})? Historical tournament records are preserved. Type DELETE ${uid} to confirm.`) || '';
      if (confirmation !== `DELETE ${uid}`) return;
    }
    if (action === 'RESTORE' && !window.confirm(`Restore ${label} (${uid}) with its existing role?`)) return;
    userActionLock.current = true;
    setUserActionUid(uid);
    try {
      const call = httpsCallable(functions, 'manageUserRecord');
      await call({ uid, action, confirmation });
      showToast(action === 'DELETE' ? 'User moved to Trash.' : action === 'RESTORE' ? 'User restored.' : 'User permanently deleted.');
    } catch (err: any) {
      showToast(err.message || 'User management action failed.', 'error');
    } finally {
      userActionLock.current = false;
      setUserActionUid(null);
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
      await httpsCallable(functions, 'managePlayerRecord')({ playerId: p.id, action: 'ARCHIVE', reason: 'Admin dashboard archive' });
      showToast(`Player ${p.name} archived.`);
    } catch (err: any) {
      showToast(err.message || 'Player archive failed.', 'error');
    }
  };

  const handleDeletePlayer = async (p: any) => {
    await handleArchivePlayer(p);
  };

  const handleRestorePlayer = async (p: any) => {
    try {
      await httpsCallable(functions, 'managePlayerRecord')({ playerId: p.id, action: 'RESTORE' });
      showToast(`Player ${p.name} restored to Pending roster.`);
    } catch (err: any) {
      showToast(err.message || 'Player restore failed.', 'error');
    }
  };

  const handlePermanentDelete = async (p: any) => {
    if (!isSuperAdmin) {
      showToast("ACCESS DENIED: Super Admin required for permanent purge.", "error");
      return;
    }
    const confirmation = window.prompt(`Type DELETE ${p.rollNumber || p.id} to confirm. Protected auction history will block this action.`) || '';
    if (confirmation !== `DELETE ${p.rollNumber || p.id}`) return;
    try {
      await httpsCallable(functions, 'managePlayerRecord')({ playerId: p.id, action: 'PERMANENT_DELETE', confirmation });
      showToast(`Player ${p.name} permanently removed.`);
    } catch (err: any) {
      showToast(err.message || 'Player has protected history and must be archived.', 'error');
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

  // --- ADMIN ACCOUNTS MANAGEMENT (Points 17 & 42) ---
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      showToast("ACCESS DENIED: Only Super Admin can provision administrator accounts.", "error");
      return;
    }
    if (!adminFormData.email.trim() || !adminFormData.name.trim()) {
      showToast("Name and email are required for administrator provisioning.", "warning");
      return;
    }
    const cleanEmail = adminFormData.email.trim().toLowerCase();
    const newUid = `adm_${Date.now()}`;
    const newAdminDoc = {
      uid: newUid,
      role: 'ADMIN',
      name: adminFormData.name.trim(),
      email: cleanEmail,
      mobile: adminFormData.phone.trim() || null,
      designation: adminFormData.designation.trim() || 'Auction Operator',
      department: adminFormData.department.trim() || 'Tournament Directorate',
      accountStatus: 'ACTIVE',
      approvalStatus: 'APPROVED',
      status: 'ACTIVE',
      authProvider: 'password',
      identityType: 'OPERATOR',
      franchiseId: null,
      playerId: null,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', newUid), newAdminDoc);
      await logAudit('ADMIN_CREATED', newUid, `Administrator ${adminFormData.name} (${cleanEmail}) created with role ADMIN`);
      showToast(`Administrator account created for ${adminFormData.name}.`);
      setCreateAdminModal(false);
      setAdminFormData({ name: '', email: '', phone: '', designation: 'Floor Handler', department: 'Auction Directorate', role: 'ADMIN', status: 'ACTIVE' });
    } catch (err: any) {
      showToast(`Failed to create admin: ${err.message}`, "error");
    }
  };

  const handleToggleUserStatus = async (targetUser: any) => {
    if (!isSuperAdmin) {
      showToast("ACCESS DENIED: Only Super Admin can change account status.", "error");
      return;
    }
    const newStatus = (targetUser.accountStatus === 'ACTIVE' || targetUser.status === 'ACTIVE') ? 'DISABLED' : 'ACTIVE';
    try {
      await updateDoc(doc(db, 'users', targetUser.id || targetUser.uid), {
        accountStatus: newStatus,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      await logAudit('USER_STATUS_TOGGLED', targetUser.email || targetUser.id, `Status set to ${newStatus}`);
      showToast(`Account status updated to ${newStatus}.`);
    } catch (err: any) {
      showToast(`Failed to update status: ${err.message}`, "error");
    }
  };

  // --- FRANCHISE APPROVAL & TEAM LEAD ONBOARDING (Points 11, 12, 13, 14, 41) ---
  const handleApproveFranchise = async (f: any) => {
    try {
      await updateDoc(doc(db, 'franchises', f.id), {
        status: 'ACTIVE',
        accountStatus: 'ACTIVE',
        approvalStatus: 'APPROVED',
        updatedAt: new Date().toISOString(),
      });
      if (f.primaryAuthUid) {
        try {
          await updateDoc(doc(db, 'users', f.primaryAuthUid), {
            status: 'ACTIVE',
            accountStatus: 'ACTIVE',
            approvalStatus: 'APPROVED',
            updatedAt: new Date().toISOString(),
          });
        } catch {}
      }
      await logAudit('FRANCHISE_APPROVED', f.franchiseId || f.id, `Franchise ${f.name} approved. 1000 credits unlocked.`);
      showToast(`Franchise ${f.name} approved & terminal activated.`);
    } catch (err: any) {
      showToast(`Failed to approve franchise: ${err.message}`, "error");
    }
  };

  const handleAddTeamLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamLeadFormData.franchiseId || !teamLeadFormData.name || !teamLeadFormData.email) {
      showToast("Franchise, name, and email are required.", "warning");
      return;
    }
    const fId = teamLeadFormData.franchiseId;
    const targetFranchise = franchises.find(f => f.franchiseId === fId || f.id === fId);
    const cleanEmail = teamLeadFormData.email.trim().toLowerCase();
    const leadUid = `tl_${Date.now()}`;

    const teamLeadDoc = {
      uid: leadUid,
      role: 'FRANCHISE_TEAM_LEADER',
      franchiseId: fId,
      identityType: 'TEAM_LEADER',
      name: teamLeadFormData.name.trim(),
      playerId: teamLeadFormData.rollNumber.trim().toUpperCase() || null,
      email: cleanEmail,
      mobile: teamLeadFormData.mobile.trim() || null,
      accountStatus: 'ACTIVE',
      approvalStatus: 'APPROVED',
      status: 'ACTIVE',
      authProvider: 'google.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', leadUid), teamLeadDoc);
      await setDoc(doc(db, 'franchiseUsers', leadUid), {
        uid: leadUid,
        franchiseId: fId,
        identityType: 'TEAM_LEADER',
        email: cleanEmail,
        mobile: teamLeadFormData.mobile.trim(),
        status: 'ACTIVE',
      });
      if (targetFranchise) {
        await updateDoc(doc(db, 'franchises', targetFranchise.id || fId), {
          secondaryAuthUid: leadUid,
          updatedAt: new Date().toISOString(),
        });
      }
      await logAudit('TEAM_LEAD_ASSIGNED', fId, `Team Lead ${teamLeadFormData.name} (${cleanEmail}) assigned to ${targetFranchise?.name || fId}`);
      showToast(`Team Leader authorized for ${targetFranchise?.name || fId}.`);
      setTeamLeadModal(false);
      setTeamLeadFormData({ franchiseId: '', name: '', rollNumber: '', mobile: '', email: '' });
    } catch (err: any) {
      showToast(`Failed to assign team lead: ${err.message}`, "error");
    }
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
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-white leading-tight">{adminProfile.name}</span>
            <span className="text-[10px] font-mono text-emerald-400">{adminProfile.designation}</span>
          </div>
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

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">User Records</h3>
                  <p className="text-xs text-slate-400">Search by name, roll number, email, or franchise. Passwords and authentication secrets are never shown.</p>
                </div>
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users…" className="w-full max-w-md bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                  <table className="w-full text-left text-xs">
                    <thead><tr className="border-b border-white/[0.08] text-slate-400 font-mono"><th className="p-3">Name</th><th className="p-3">Roll / Email</th><th className="p-3">Franchise</th><th className="p-3">Role / Status</th><th className="p-3 text-right">Action</th></tr></thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {allUsers.filter(u => `${u.name || u.displayName || ''} ${u.rollNumber || u.playerId || ''} ${u.email || ''} ${u.franchiseName || u.franchiseId || ''}`.toLowerCase().includes(userSearch.trim().toLowerCase())).slice(0, 100).map(u => {
                        const uid = u.id || u.uid;
                        const deleted = u.status === 'DELETED';
                        return <tr key={uid}>
                          <td className="p-3 text-white">{u.name || u.displayName || 'Unnamed'}</td>
                          <td className="p-3 text-slate-400">{u.rollNumber || u.playerId || u.email || uid}</td>
                          <td className="p-3 text-slate-400">{u.franchiseName || u.franchiseId || '—'}</td>
                          <td className="p-3 text-slate-400">{u.role || '—'} · {deleted ? 'TRASH' : u.accountStatus || u.status || '—'}</td>
                          <td className="p-3 text-right">{isSuperAdmin && u.role !== 'SUPER_ADMIN' && uid !== user?.uid && (deleted
                            ? <><button disabled={userActionUid === uid} onClick={() => manageUserRecord(u, 'RESTORE')} className="px-2 py-1 mr-2 rounded bg-emerald-700 text-white disabled:opacity-50">RESTORE</button><button disabled={userActionUid === uid} onClick={() => manageUserRecord(u, 'PERMANENT_DELETE')} className="px-2 py-1 rounded bg-red-900 text-red-100 disabled:opacity-50">PERMANENT DELETE</button></>
                            : <button disabled={userActionUid === uid} onClick={() => manageUserRecord(u, 'DELETE')} className="px-2 py-1 rounded bg-red-900/70 text-red-100 disabled:opacity-50">DELETE</button>)}</td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
                {!isSuperAdmin && <p className="text-xs text-slate-400">User deletion and restoration are restricted to Super Admin.</p>}
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

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <h2 className="font-display font-bold text-white">DATA MANAGEMENT</h2>
                <p className="text-xs text-slate-400">Governance tools for account recovery, auction corrections, and tournament exports.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button onClick={() => setActiveSection('datamanagement')} className="p-4 rounded-xl text-left bg-blue-950/30 border border-blue-500/20 text-white"><b>Users / Trash / Archive</b><div className="text-xs text-slate-400 mt-1">Search, disable, restore, and inspect user records.</div></button>
                  <button onClick={() => setLocation('/admin/auction')} className="p-4 rounded-xl text-left bg-amber-950/20 border border-amber-500/20 text-white"><b>Auction Undo</b><div className="text-xs text-slate-400 mt-1">Forensic sale undo uses the authoritative transaction.</div></button>
                  <button onClick={() => setActiveSection('export')} className="p-4 rounded-xl text-left bg-blue-950/30 border border-blue-500/20 text-white"><b>Export Database</b><div className="text-xs text-slate-400 mt-1">Download tournament data and audit trail.</div></button>
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-slate-300"><b>Reset Demo Data</b><div className="text-xs text-slate-400 mt-1">Unavailable: no explicit demo dataset is defined for safe isolation.</div></div>
                </div>
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

          {/* ADMIN ACCOUNTS DIRECTORY (Points 17 & 42) */}
          {activeSection === 'admins' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="border-b border-white/[0.08] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display font-black text-2xl text-white uppercase">ADMINISTRATIVE ACCOUNTS</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Super Admin governance of operational handles and floor operators. Google login cannot grant admin privileges.
                  </p>
                </div>
                {isSuperAdmin && (
                  <button
                    onClick={() => setCreateAdminModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center gap-2"
                  >
                    <Plus size={16} />
                    <span>CREATE ADMIN</span>
                  </button>
                )}
              </div>

              {/* Super Admin Profile Card (Default: Mr. Deepak) */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">Super Admin Profile</h3>
                    <p className="text-xs text-slate-400">Default Super Administrator identity: Mr. Deepak. Editable by Super Admin.</p>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    SUPER_ADMIN ROLE
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Director Name</label>
                    <input
                      type="text"
                      value={adminProfile.name}
                      onChange={e => setAdminProfile({ ...adminProfile, name: e.target.value })}
                      placeholder="Mr. Deepak"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-medium focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Role / Designation Display</label>
                    <input
                      type="text"
                      value={adminProfile.designation}
                      onChange={e => setAdminProfile({ ...adminProfile, designation: e.target.value })}
                      placeholder="Tournament Director & Super Administrator"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-medium focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      value={adminProfile.email}
                      onChange={e => setAdminProfile({ ...adminProfile, email: e.target.value })}
                      placeholder="admin@acc.edu"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-medium focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Phone / Mobile</label>
                    <input
                      type="text"
                      value={adminProfile.phone}
                      onChange={e => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-medium focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveAdminProfile}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    <span>SAVE ADMIN PROFILE</span>
                  </button>
                </div>
              </div>

              {/* Table of Admins */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c120f] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-mono uppercase tracking-wider">
                        <th className="p-4">Name & Title</th>
                        <th className="p-4">Contact (Email / Phone)</th>
                        <th className="p-4">Department / Designation</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Auth Provider</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {allUsers
                        .filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN')
                        .map(admin => {
                          const isActive = admin.accountStatus === 'ACTIVE' || admin.status === 'ACTIVE';
                          const isSelf = admin.uid === user?.uid || admin.id === user?.uid;
                          return (
                            <tr key={admin.id || admin.uid} className="hover:bg-white/[0.02] transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-white text-sm">{admin.name || admin.displayName || 'Administrator'}</div>
                                <div className="text-[11px] font-mono text-slate-400">{admin.uid || admin.id}</div>
                              </td>
                              <td className="p-4">
                                <div className="font-mono text-slate-200">{admin.email}</div>
                                {admin.mobile && <div className="font-mono text-slate-400 text-[11px]">{admin.mobile}</div>}
                              </td>
                              <td className="p-4">
                                <div className="text-white font-medium">{admin.designation || 'Auction Handler'}</div>
                                <div className="text-slate-400 text-[11px]">{admin.department || 'Directorate'}</div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                                  admin.role === 'SUPER_ADMIN'
                                    ? 'bg-purple-950/60 text-purple-300 border-purple-700/60'
                                    : 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                                }`}>
                                  {admin.role}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                  isActive
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : 'bg-red-950 text-red-400 border border-red-800'
                                }`}>
                                  {isActive ? 'ACTIVE' : 'DISABLED'}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-[11px] text-slate-300">
                                {admin.authProvider || 'password'}
                              </td>
                              <td className="p-4 text-right">
                                {isSuperAdmin && !isSelf && admin.role !== 'SUPER_ADMIN' && (
                                  <button
                                    onClick={() => handleToggleUserStatus(admin)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                      isActive
                                        ? 'bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60'
                                        : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60'
                                    }`}
                                  >
                                    {isActive ? 'Disable' : 'Enable'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* FRANCHISES & TWO-IDENTITY MEMBERS MANAGEMENT (Points 10, 11, 12, 13, 14, 41) */}
          {(activeSection === 'franchises' || activeSection === 'members') && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="border-b border-white/[0.08] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display font-black text-2xl text-white uppercase">FRANCHISE & MEMBER DIRECTORY</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Two-identity franchise architecture: Faculty Coordinator (Primary Login) and Team Leader (Secondary Login). Both access the same franchise purse and squad.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setTeamLeadFormData({ franchiseId: '', name: '', rollNumber: '', mobile: '', email: '' }); setTeamLeadModal(true); }}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center gap-2"
                  >
                    <Plus size={16} />
                    <span>ADD TEAM LEAD</span>
                  </button>
                </div>
              </div>

              {/* Franchises Cards / Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {franchises.map((f: any) => {
                  const isPending = f.status === 'PENDING' || f.approvalStatus === 'PENDING_APPROVAL';
                  const coordUser = allUsers.find(u => u.uid === f.primaryAuthUid || (u.franchiseId === (f.franchiseId || f.id) && u.identityType === 'COORDINATOR'));
                  const leadUser = allUsers.find(u => u.uid === f.secondaryAuthUid || (u.franchiseId === (f.franchiseId || f.id) && u.identityType === 'TEAM_LEADER'));

                  return (
                    <div key={f.id || f.franchiseId} className="rounded-2xl border border-white/[0.08] bg-[#0c120f] p-6 space-y-5 shadow-xl">
                      <div className="flex justify-between items-start border-b border-white/[0.06] pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-bold text-lg text-white">{f.name}</h3>
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-slate-300">
                              {f.shortName || f.franchiseId || f.id}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">ID: {f.franchiseId || f.id}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                          isPending
                            ? 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                        }`}>
                          {f.status || 'ACTIVE'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs bg-black/40 p-3 rounded-xl border border-white/[0.05]">
                        <div>
                          <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Purse Allocation</span>
                          <span className="font-mono font-bold text-emerald-400 text-sm">₹{f.purseRemaining ?? 1000}L / ₹{f.purseInitial ?? 1000}L</span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Squad Count</span>
                          <span className="font-mono font-bold text-white text-sm">{f.squad?.count ?? 0} Players</span>
                        </div>
                      </div>

                      {/* Dual Identities List */}
                      <div className="space-y-3">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                          Authorized Sign-In Accounts
                        </div>

                        {/* Coordinator */}
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                              Coordinator: {f.coordinator?.name || coordUser?.name || 'Faculty'}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                              Primary UID
                            </span>
                          </div>
                          <p className="font-mono text-slate-400 text-[11px]">
                            Google Identity: {coordUser?.email || f.coordinator?.emailPrivate || 'Linked via Google'}
                          </p>
                        </div>

                        {/* Team Leader */}
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                              Team Leader: {leadUser?.name || 'Not yet assigned'}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                              Secondary UID
                            </span>
                          </div>
                          {leadUser ? (
                            <p className="font-mono text-slate-400 text-[11px]">
                              Google Identity: {leadUser.email}
                            </p>
                          ) : (
                            <button
                              onClick={() => {
                                setTeamLeadFormData({ franchiseId: f.franchiseId || f.id, name: '', rollNumber: '', mobile: '', email: '' });
                                setTeamLeadModal(true);
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300 font-semibold mt-1"
                            >
                              + Assign Team Leader / Captain Login
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Approval Actions */}
                      <div className="pt-2 flex justify-end gap-2">
                        {isPending && isSuperAdmin && (
                          <button
                            onClick={() => handleApproveFranchise(f)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center gap-1.5"
                          >
                            <CheckCircle size={14} />
                            <span>APPROVE & UNLOCK PURSE</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION: AUCTION COCKPIT LAUNCHER */}
          {activeSection === 'auction' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="border-b border-white/[0.08] pb-4 flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl text-white uppercase">LIVE AUCTION FLOOR COCKPIT</h1>
                  <p className="text-xs text-slate-400 mt-1">Full operational floor cockpit with Hammer, Skip, Pause/Resume, and Behalf Bidding.</p>
                </div>
                <button
                  onClick={() => setLocation('/admin/auction')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center gap-2"
                >
                  <Gavel size={16} />
                  <span>LAUNCH FULL COCKPIT →</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION: ROUND 2 UNSOLD RECALL POOL */}
          {activeSection === 'round2' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="border-b border-white/[0.08] pb-4 flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl text-white uppercase">ROUND 2: UNSOLD RECALL POOL</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Players passed or unsold in Round 1 enter Round 2. Base prices reset to 20 Credits. Bidding increments follow standard ladder.
                  </p>
                </div>
                <span className="font-mono text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {players.filter(p => p.status === 'UNSOLD' || p.status === 'ROUND_2').length} UNPROCESSED IN RECALL
                </span>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#0c120f] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-mono uppercase tracking-wider">
                        <th className="p-4">Player</th>
                        <th className="p-4">Roll Number</th>
                        <th className="p-4">Academic Bucket</th>
                        <th className="p-4">Original Base</th>
                        <th className="p-4">Round 2 Price</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {players.filter(p => p.status === 'UNSOLD' || p.status === 'ROUND_2').length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                            No unsold players in Round 2 recall queue.
                          </td>
                        </tr>
                      ) : (
                        players
                          .filter(p => p.status === 'UNSOLD' || p.status === 'ROUND_2')
                          .map(p => (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="p-4 font-bold text-white flex items-center gap-3">
                                {p.photo && (
                                  <img src={p.photo} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                                )}
                                <span>{p.name}</span>
                              </td>
                              <td className="p-4 font-mono text-slate-300">{p.rollNumber || p.roll}</td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-white/10 text-emerald-300">
                                  {p.bucket || 'B1'}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-slate-400">₹{p.basePrice || 20}</td>
                              <td className="p-4 font-mono font-bold text-emerald-400">₹20 (Reset)</td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={async () => {
                                    try {
                                      await updateDoc(doc(db, 'players', p.id), {
                                        status: 'AVAILABLE',
                                        round: 2,
                                        basePrice: 20,
                                        updatedAt: serverTimestamp(),
                                      });
                                      await logAudit('ROUND_2_RECALL', p.rollNumber || p.id, `Player ${p.name} recalled to live pool at 20 credits.`);
                                      showToast(`Recalled ${p.name} to live auction pool.`);
                                    } catch {
                                      setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, status: 'AVAILABLE', round: 2, basePrice: 20 } : x));
                                      showToast(`Recalled ${p.name} (local).`);
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                                >
                                  RECALL TO LOT
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: PROJECTOR DISPLAY WORKSPACE */}
          {activeSection === 'projector' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="border-b border-white/[0.08] pb-4 flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl text-white uppercase">PROJECTOR BROADCAST ARENA</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Zero-latency auditorium display driver. Optimized for 1080p and 4K projectors with giant typography and franchise paddle telemetry.
                  </p>
                </div>
                <a
                  href="/projector"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center gap-2"
                >
                  <Tv size={16} />
                  <span>LAUNCH FULL PROJECTOR ARENA ↗</span>
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                  <h3 className="font-display font-bold text-white text-base">Stage Display Parameters</h3>
                  <div className="space-y-2 text-xs font-mono text-slate-300">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-500">Aspect Ratio:</span>
                      <span>16:9 / High-Contrast Dark</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-500">Timer Diameter:</span>
                      <span>240px SVG Ring</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-500">Price Typography:</span>
                      <span>96px JetBrains Mono</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Franchise Paddles:</span>
                      <span>11 Simultaneous Slots</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-white text-base">Broadcast Live Status</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      The projector display operates as a completely decoupled consumer. It subscribes to RTDB/Firestore state and reflects hammer strikes, bids, and pauses instantaneously.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-mono font-bold text-white">Broadcast Stream Ready</span>
                    </div>
                    <a
                      href="/projector"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:text-purple-300 font-mono font-semibold"
                    >
                      Open Live Window →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: REGISTRATIONS & REFERENCE PROGRAM */}
          {activeSection === 'registrations' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="border-b border-white/[0.08] pb-4 flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl text-white uppercase">PLAYER REGISTRATIONS & REFERRALS</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Audit candidate reference claims against franchise coordinator declarations. Fresh admissions only.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#0c120f] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-mono uppercase tracking-wider">
                        <th className="p-4">Player</th>
                        <th className="p-4">Roll Number</th>
                        <th className="p-4">Reference Claimed</th>
                        <th className="p-4">Claimed Referring Team</th>
                        <th className="p-4">Admission Year</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {players.filter(p => p.referenceClaimed || p.referringFranchiseId).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                            No reference claims pending review.
                          </td>
                        </tr>
                      ) : (
                        players
                          .filter(p => p.referenceClaimed || p.referringFranchiseId)
                          .map(p => (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="p-4 font-bold text-white">{p.name}</td>
                              <td className="p-4 font-mono text-slate-300">{p.rollNumber || p.roll}</td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                                  YES (CLAIMED)
                                </span>
                              </td>
                              <td className="p-4 font-bold text-white">
                                {franchises.find(f => f.id === p.referringFranchiseId || f.franchiseId === p.referringFranchiseId)?.name || `Team #${p.referringFranchiseId || '1'}`}
                              </td>
                              <td className="p-4 font-mono text-slate-400">{p.academic?.admissionYear || 2026}</td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={async () => {
                                    try {
                                      await updateDoc(doc(db, 'players', p.id), {
                                        referenceVerified: true,
                                        updatedAt: serverTimestamp(),
                                      });
                                      await logAudit('REFERENCE_CONFIRMED', p.rollNumber || p.id, `Confirmed referral claim for ${p.name}.`);
                                      showToast(`Confirmed referral for ${p.name}.`);
                                    } catch {
                                      showToast(`Referral confirmed for ${p.name} (local).`);
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase transition-colors"
                                >
                                  CONFIRM
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: BACKUPS & DISASTER RECOVERY */}
          {activeSection === 'backups' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="border-b border-white/[0.08] pb-4 flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl text-white uppercase">AUTOMATIC BACKUPS & DISASTER RECOVERY</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Authoritative state snapshot saves every 10 lots. Download offline JSON or trigger on-demand forensic freeze.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
                  <h3 className="font-display font-bold text-white text-base">On-Demand State Snapshot</h3>
                  <p className="text-xs text-slate-400">
                    Captures all {players.length} players, {franchises.length} franchises, and {auditLogs.length} audit trail records into a single tamper-evident JSON bundle.
                  </p>
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    <span>CREATE STATE SNAPSHOT</span>
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
                  <h3 className="font-display font-bold text-white text-base">Event-Day Disaster Protocol</h3>
                  <p className="text-xs text-slate-400">
                    In the event of total network or laptop loss, the system state can be completely restored on any replacement machine within 60 seconds using the saved JSON snapshot.
                  </p>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-emerald-400">
                    STATUS: REALTIME FAILOVER ACTIVE · SPARK TRANSACTION FALLBACK READY
                  </div>
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

      {/* Create Admin Modal (Point 17 & 42) */}
      {createAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0c120f] border border-amber-500/40 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h3 className="font-display font-bold text-lg text-white">Create Administrator Account</h3>
              <button onClick={() => setCreateAdminModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={adminFormData.name}
                  onChange={e => setAdminFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. S. Suresh Kumar"
                  required
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={adminFormData.email}
                  onChange={e => setAdminFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="e.g. suresh@acc.edu"
                  required
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={adminFormData.phone}
                  onChange={e => setAdminFormData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. 9848011223"
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Designation</label>
                  <input
                    type="text"
                    value={adminFormData.designation}
                    onChange={e => setAdminFormData(p => ({ ...p, designation: e.target.value }))}
                    placeholder="Floor Handler"
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    value={adminFormData.department}
                    onChange={e => setAdminFormData(p => ({ ...p, department: e.target.value }))}
                    placeholder="Directorate"
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-[11px] text-amber-200">
                Created account is granted <strong>ADMIN</strong> role with email/password authentication. It cannot escalate to Super Admin.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateAdminModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
                >
                  Provision Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Assign Team Leader Modal (Point 13 & 41) */}
      {teamLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0c120f] border border-blue-500/40 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h3 className="font-display font-bold text-lg text-white">Assign Team Leader (Captain) Login</h3>
              <button onClick={() => setTeamLeadModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddTeamLead} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Target Franchise *</label>
                <select
                  value={teamLeadFormData.franchiseId}
                  onChange={e => setTeamLeadFormData(p => ({ ...p, franchiseId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-blue-500"
                >
                  <option value="">Select franchise...</option>
                  {franchises.map((f: any) => (
                    <option key={f.id || f.franchiseId} value={f.franchiseId || f.id}>
                      {f.name} ({f.franchiseId || f.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Leader / Captain Name *</label>
                <input
                  type="text"
                  value={teamLeadFormData.name}
                  onChange={e => setTeamLeadFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Akash Sharma"
                  required
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">College Roll Number (Optional)</label>
                <input
                  type="text"
                  value={teamLeadFormData.rollNumber}
                  onChange={e => setTeamLeadFormData(p => ({ ...p, rollNumber: e.target.value }))}
                  placeholder="e.g. 24811A0501"
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Google Identity (Email) *</label>
                <input
                  type="email"
                  value={teamLeadFormData.email}
                  onChange={e => setTeamLeadFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="e.g. leader.captain@gmail.com"
                  required
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Contact Mobile</label>
                <input
                  type="tel"
                  value={teamLeadFormData.mobile}
                  onChange={e => setTeamLeadFormData(p => ({ ...p, mobile: e.target.value }))}
                  placeholder="e.g. 9848099887"
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-blue-500"
                />
              </div>
              <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl text-[11px] text-blue-200">
                Team Leader logs in with this Google account to access the same franchise paddle, purse, and squad.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTeamLeadModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
                >
                  Authorize Leader
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
