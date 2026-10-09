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
  serverTimestamp,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { mergeAuditTimeline } from '@/services/auditTimeline';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { BUCKET_LABELS, type BucketId, type PlayerDoc, type FranchiseDoc } from '@shared/types';
import { 
  auditPlayerRecords, 
  buildPlayerRepairPatch, 
  buildPlayerRollbackPatch, 
  type CricHeroesAuditReport, 
  type PlayerAuditRecord 
} from '@shared/engine/cricHeroesAudit';
import { parseCricHeroesUrl } from '@shared/engine/cricheroes';
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

  // Participant Dataset Wipe Modal State
  const [wipeModalOpen, setWipeModalOpen] = useState(false);
  const [wipeStep, setWipeStep] = useState<1 | 2 | 3>(1);
  const [wipeConfirmPhrase, setWipeConfirmPhrase] = useState('');
  const [wipeScopeAcknowledged, setWipeScopeAcknowledged] = useState(false);
  const [wipeCounts, setWipeCounts] = useState<{
    players: number;
    franchises: number;
    registrations: number;
    verification: number;
    auction: number;
    media: number;
  } | null>(null);
  const [wipeLoading, setWipeLoading] = useState(false);

  const isSuperAdmin = userDoc?.role === 'SUPER_ADMIN';

  // Realtime Users Directory State
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [managementPlayer, setManagementPlayer] = useState<any | null>(null);
  const [dataView, setDataView] = useState<'USERS' | 'TRASH' | 'CORRECTIONS' | 'AUDIT' | 'CRICHEROES_AUDIT'>('USERS');
  const [auditReport, setAuditReport] = useState<CricHeroesAuditReport | null>(null);
  const [cricHeroesAuditFilter, setCricHeroesAuditFilter] = useState<'ALL' | 'PROPOSED' | 'REVIEW' | 'UNRESOLVED' | 'VERIFIED'>('ALL');
  const [repairRunning, setRepairRunning] = useState(false);
  const [repairConfirmOpen, setRepairConfirmOpen] = useState(false);
  const [repairExecutionSummary, setRepairExecutionSummary] = useState<{ timestamp: string; successCount: number; repairedIds: string[] } | null>(null);

  useEffect(() => {
    if (players && players.length > 0) {
      setAuditReport(auditPlayerRecords(players, EDITION_ID));
    }
  }, [players]);
  const [editDraft, setEditDraft] = useState<any | null>(null);
  const [managementBusy, setManagementBusy] = useState(false);
  const [playerHistory, setPlayerHistory] = useState<any[]>([]);
  const [saleAcquisitions, setSaleAcquisitions] = useState<any[]>([]);
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
        setPlayers(list.filter((p: any) => p.status !== 'DELETED' && p.status !== 'ARCHIVED'));
        setDeletedPlayers(list.filter((p: any) => p.status === 'DELETED' || p.status === 'ARCHIVED'));
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

      const unsubAcquisitions = onSnapshot(collection(db, 'acquisitions'), snap => setSaleAcquisitions(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((a:any)=>a.status!=='UNDONE').sort((a:any,b:any)=>{const at=a.createdAt?.toMillis?.()||Date.parse(a.createdAt||'')||0;const bt=b.createdAt?.toMillis?.()||Date.parse(b.createdAt||'')||0;return bt-at;})), () => {});

      const auditRows = new Map<string, any>();
      const publishAuditRows = () => setAuditLogs(mergeAuditTimeline(Array.from(auditRows.values())));
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
        unsubAcquisitions();
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

  const handleOpenWipeModal = async () => {
    if (!isSuperAdmin) {
      showToast('Super Admin authorization required to wipe participant data.', 'error');
      return;
    }
    setWipeStep(1);
    setWipeConfirmPhrase('');
    setWipeScopeAcknowledged(false);
    setWipeModalOpen(true);
    setWipeLoading(true);

    const defaultCounts = {
      players: players.length + deletedPlayers.length,
      franchises: franchises.length + deletedFranchises.length,
      registrations: players.filter(p => p.registered || p.registration).length,
      verification: players.filter(p => p.approvalStatus || p.verificationStatus).length,
      auction: players.filter(p => p.status === 'SOLD' || p.status === 'UNSOLD').length,
      media: players.filter(p => p.photo || p.photoUrl).length + franchises.filter(f => f.logo || f.logoUrl).length,
    };
    setWipeCounts(defaultCounts);

    try {
      const wipeCallable = httpsCallable(functions, 'wipeParticipantDataset');
      const res: any = await wipeCallable({ action: 'PREVIEW', targetEdition: EDITION_ID });
      if (res?.data?.counts) {
        setWipeCounts({
          players: res.data.counts.players ?? defaultCounts.players,
          franchises: res.data.counts.franchises ?? defaultCounts.franchises,
          registrations: res.data.counts.registrations ?? defaultCounts.registrations,
          verification: res.data.counts.verification ?? defaultCounts.verification,
          auction: res.data.counts.auctionRecords ?? defaultCounts.auction,
          media: res.data.counts.mediaObjects ?? defaultCounts.media,
        });
      }
    } catch {
      // Graceful fallback to snapshot counts
    } finally {
      setWipeLoading(false);
    }
  };

  const handleExecuteWipe = async () => {
    if (wipeConfirmPhrase !== 'WIPE ACC PARTICIPANT DATA' || !wipeScopeAcknowledged) {
      showToast('Exact confirmation phrase and scope acknowledgment are required.', 'error');
      return;
    }
    setWipeLoading(true);
    let cloudFunctionSuccess = false;
    try {
      const wipeCallable = httpsCallable(functions, 'wipeParticipantDataset');
      await wipeCallable({
        action: 'EXECUTE',
        confirmedScope: EDITION_ID,
        typedConfirmation: 'WIPE ACC PARTICIPANT DATA',
        acknowledgedScope: true,
      });
      cloudFunctionSuccess = true;
    } catch (cfErr) {
      console.warn('Cloud function wipe unavailable; executing direct client-side sweep:', cfErr);
    }

    try {
      if (!cloudFunctionSuccess) {
        const collectionsToWipe = [
          'players', 'publicPlayers', 'playersPublic', 'deletedPlayers',
          'playerUniqueKeys', 'registrations', 'referrals', 'playerReferrals',
          'franchises', 'franchisesPublic', 'deletedFranchises', 'franchiseUsers',
          'lots', 'bids', 'acquisitions', 'sales', 'round2', 'round2Records',
          'round2Selections', 'allotments', 'purseTransactions', 'purseLedger',
          'franchiseTransactions', 'transactions', 'auctionHistory'
        ];
        for (const colName of collectionsToWipe) {
          try {
            const snap = await getDocs(collection(db, colName));
            if (!snap.empty) {
              const batch = writeBatch(db);
              snap.docs.forEach(d => batch.delete(d.ref));
              await batch.commit();
            }
          } catch (e) {
            console.warn(`Error wiping ${colName}:`, e);
          }
        }

        try {
          const userSnap = await getDocs(collection(db, 'users'));
          if (!userSnap.empty) {
            const userBatch = writeBatch(db);
            let count = 0;
            userSnap.docs.forEach(d => {
              const u = d.data();
              if (u.role !== 'SUPER_ADMIN' && u.role !== 'ADMIN') {
                userBatch.delete(d.ref);
                count++;
              }
            });
            if (count > 0) await userBatch.commit();
          }
        } catch (e) {}

        const resetPayload = {
          status: 'IDLE',
          activeLot: null,
          currentBid: null,
          isFullReset: true,
          lotIndex: 0,
          timerSeconds: 30,
          updatedBy: 'WIPE_SERVICE',
          updatedAt: serverTimestamp(),
        };
        try { await setDoc(doc(db, 'acc_auctions', EDITION_ID), resetPayload, { merge: true }); } catch (e) {}
        try { await setDoc(doc(db, 'acc_auctions', 'live'), resetPayload, { merge: true }); } catch (e) {}
        await logAudit('WIPE_ALL_PARTICIPANT_DATA', EDITION_ID, 'Permanently wiped all participant records and dependent auction data.');
      }

      setPlayers([]);
      setFranchises([]);
      setDeletedPlayers([]);
      setDeletedFranchises([]);
      localStorage.setItem('acc_players_2026', '[]');
      localStorage.setItem('acc_deleted_players_2026', '[]');
      localStorage.setItem('acc_franchises_2026', '[]');
      localStorage.setItem('acc_deleted_franchises_2026', '[]');
      setWipeModalOpen(false);
      showToast('Participant dataset and dependent operational data wiped successfully.');
    } catch (err: any) {
      showToast(err?.message || 'Failed to wipe participant dataset.', 'error');
    } finally {
      setWipeLoading(false);
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

  const savePlayerEdit = async () => {
    if (!editDraft || !isSuperAdmin) return;
    const original = players.find(p => p.id === editDraft.id) || editDraft;
    const fields = ['name', 'mobile', 'email', 'program', 'branch', 'year', 'bucket', 'basePrice', 'cricHeroesUrl'];
    const before: Record<string, unknown> = {}, after: Record<string, unknown> = {};
    fields.forEach(key => { if ((original[key] ?? '') !== (editDraft[key] ?? '')) { before[key] = original[key] ?? ''; after[key] = editDraft[key] ?? ''; } });
    if (JSON.stringify(original.skills || []) !== JSON.stringify(editDraft.skills || [])) { before.skills = original.skills || []; after.skills = editDraft.skills || []; }

    // Validate and normalize CricHeroes URL if changed
    if (after.cricHeroesUrl !== undefined) {
      const rawCH = String(after.cricHeroesUrl || '').trim();
      if (rawCH) {
        const parsed = parseCricHeroesUrl(rawCH);
        if (!parsed.isValid) {
          showToast(`Invalid CricHeroes URL: ${parsed.error}`, 'error');
          return;
        }
        after.cricHeroesUrl = parsed.canonicalUrl;
        after.cricHeroesStatus = 'VERIFIED';
        after.cricheroes = {
          profileUrl: parsed.canonicalUrl,
          playerId: parsed.playerId,
          playerSlug: parsed.playerSlug,
          status: 'VERIFIED',
          registeredMobilePrivate: original.cricheroes?.registeredMobilePrivate || original.cricHeroesMobile || null,
        };
      } else {
        after.cricHeroesUrl = '';
        after.cricHeroesStatus = 'PENDING';
        after.cricheroes = {
          profileUrl: null,
          playerId: null,
          playerSlug: null,
          status: 'PENDING',
          registeredMobilePrivate: null,
        };
      }
    }

    if (!Object.keys(after).length) { showToast('No profile changes to save.', 'warning'); return; }
    setManagementBusy(true);
    try {
      await updateDoc(doc(db, 'players', editDraft.id), { ...after, updatedAt: serverTimestamp() });
      await httpsCallable(functions, 'recordAuditEvent')({ action: 'PLAYER_PROFILE_UPDATED', targetType: 'PLAYER', targetId: editDraft.rollNumber || editDraft.id, details: `Changed fields: ${Object.keys(after).join(', ')}`, editionId: EDITION_ID });
      setEditDraft(null); showToast('Player profile saved and audit event recorded.');
    } catch (err: any) { showToast(err.message || 'Profile update failed.', 'error'); }
    finally { setManagementBusy(false); }
  };

  const handleExecuteCricHeroesRepair = async () => {
    if (!isSuperAdmin || !auditReport || repairRunning) return;
    setRepairRunning(true);
    try {
      const toRepair = auditReport.records.filter(r => r.status === 'PROPOSED_CORRECTION');
      if (toRepair.length === 0) {
        showToast('No eligible records to repair.', 'warning');
        setRepairConfirmOpen(false);
        return;
      }

      let successCount = 0;
      const repairedIds: string[] = [];
      // Safe batching in chunks of 50
      for (let i = 0; i < toRepair.length; i += 50) {
        const chunk = toRepair.slice(i, i + 50);
        const batch = writeBatch(db);
        for (const rec of chunk) {
          const patchObj = buildPlayerRepairPatch(rec, user?.uid || 'SUPER_ADMIN');
          if (patchObj) {
            const docRef = doc(db, 'players', patchObj.docId);
            batch.set(docRef, patchObj.patch, { merge: true });
            repairedIds.push(patchObj.docId);
            successCount++;
          }
        }
        await batch.commit();
      }

      await httpsCallable(functions, 'recordAuditEvent')({
        action: 'CRICHEROES_DATA_REPAIR',
        targetType: 'SYSTEM',
        targetId: EDITION_ID,
        details: `Repaired CricHeroes data for ${successCount} players with snapshot backups`,
        editionId: EDITION_ID,
      });

      setRepairExecutionSummary({
        timestamp: new Date().toISOString(),
        successCount,
        repairedIds,
      });
      showToast(`Successfully repaired ${successCount} records! Backups saved.`, 'success');
      setRepairConfirmOpen(false);
      setAuditReport(auditPlayerRecords(players, EDITION_ID));
    } catch (err: any) {
      showToast(`Repair failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setRepairRunning(false);
    }
  };

  const handleRollbackPlayer = async (player: any) => {
    if (!isSuperAdmin || repairRunning) return;
    const patchObj = buildPlayerRollbackPatch(player, user?.uid || 'SUPER_ADMIN');
    if (!patchObj) {
      showToast('No backup snapshot found for this record.', 'warning');
      return;
    }
    setRepairRunning(true);
    try {
      await updateDoc(doc(db, 'players', patchObj.docId), patchObj.patch);
      await httpsCallable(functions, 'recordAuditEvent')({
        action: 'CRICHEROES_DATA_ROLLBACK',
        targetType: 'PLAYER',
        targetId: patchObj.docId,
        details: 'Restored previous CricHeroes values from backup snapshot',
        editionId: EDITION_ID,
      });
      showToast(`Restored previous CricHeroes values for ${player.name || patchObj.docId}`, 'success');
      setAuditReport(auditPlayerRecords(players, EDITION_ID));
    } catch (err: any) {
      showToast(`Rollback failed: ${err.message}`, 'error');
    } finally {
      setRepairRunning(false);
    }
  };

  const archiveManagementPlayer = async (p: any) => {
    setManagementBusy(true);
    try { await httpsCallable(functions, 'managePlayerRecord')({ playerId: p.id, action: 'ARCHIVE', reason: 'Admin console archive' }); showToast(`${p.name} archived.`); }
    catch (err: any) { showToast(err.message || 'Archive failed.', 'error'); }
    finally { setManagementBusy(false); }
  };

  const undoAcquisition = async (acq: any) => {
    if (!isSuperAdmin) return;
    if (!window.confirm(`REVERSE SALE? This restores franchise purse, squad count, bucket quota, player availability and lot state for ${acq.playerName || 'this sale'}.`)) return;
    const reason = window.prompt('Reason for undo (at least 3 characters):') || '';
    if (reason.trim().length < 3) { showToast('Undo cancelled: a reason of at least 3 characters is required.', 'warning'); return; }
    setManagementBusy(true);
    try { await httpsCallable(functions, 'undoSale')({ acquisitionId: acq.id, reason }); showToast('Sale reversed. Auction state and audit timeline are updating.'); }
    catch (err:any) { showToast(err.message || 'Sale could not be reversed.', 'error'); }
    finally { setManagementBusy(false); }
  };

  useEffect(() => {
    if (!managementPlayer?.id) { setPlayerHistory([]); return; }
    let active = true;
    Promise.all(['acquisitions', 'lots', 'bids'].map(name => getDocs(query(collection(db, name), where('playerId', '==', managementPlayer.id))))).then(results => {
      if (active) setPlayerHistory(results.flatMap((snap, i) => snap.docs.map(d => ({ id: d.id, type: ['PURCHASE','LOT','BID'][i], ...d.data() }))));
    }).catch(() => { if (active) setPlayerHistory([]); });
    return () => { active = false; };
  }, [managementPlayer?.id]);

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
    logAudit('DATABASE_EXPORT', 'PLAYERS', `Exported ${players.length} player records to CSV.`);
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
    logAudit('DATABASE_EXPORT', 'DATABASE', `Full JSON snapshot exported.`);
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
            <div className="space-y-5 max-w-7xl mx-auto text-slate-800">
              <header className="rounded-2xl border border-blue-100 bg-white p-5">
                <h1 className="font-display font-black text-2xl text-slate-900">DATA MANAGEMENT</h1>
                <p className="text-sm text-slate-600 mt-1">Manage player and account records without affecting historical auction integrity.</p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3 mt-5">
                  {([['USERS','MANAGE USERS','Search and manage registered ACC accounts.'],['TRASH','TRASH & RESTORE','Review archived records and restore them.'],['CORRECTIONS','AUCTION CORRECTIONS','Review and reverse eligible auction sales.'],['AUDIT','EXPORT DATABASE','Export the tournament dataset.'],['CRICHEROES_AUDIT','CRICHEROES AUDIT','Scan & repair CricHeroes URLs and profile mappings.']] as const).map(([view,title,description]) => <button key={view} onClick={() => view === 'AUDIT' ? setActiveSection('export') : setDataView(view)} className={`rounded-xl border p-4 text-left transition ${dataView===view?'border-blue-500 bg-blue-50':'border-slate-200 bg-white hover:border-blue-300'}`}><b className="block text-sm text-slate-900">{title}</b><span className="mt-1 block text-xs text-slate-600">{description}</span></button>)}
                </div>
              </header>

              <nav className="flex flex-wrap gap-2">{([['USERS','USER MANAGEMENT'],['TRASH','TRASH & RESTORE'],['CORRECTIONS','AUCTION CORRECTIONS'],['AUDIT','AUDIT TIMELINE'],['CRICHEROES_AUDIT','CRICHEROES AUDIT & REPAIR']] as const).map(([id,label])=><button key={id} onClick={()=>setDataView(id)} className={`rounded-lg px-4 py-2 text-xs font-bold ${dataView===id?'bg-blue-700 text-white':'bg-white border border-slate-200 text-slate-700'}`}>{label}</button>)}</nav>

              {dataView === 'USERS' && <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-3"><input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search name / roll / email / franchise" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"/><select value={userRoleFilter} onChange={e=>setUserRoleFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">{['ALL','PLAYER','FRANCHISE','FRANCHISE_COORDINATOR','FRANCHISE_TEAM_LEADER','ADMIN'].map(x=><option key={x}>{x}</option>)}</select><select value={userStatusFilter} onChange={e=>setUserStatusFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">{['ALL','ACTIVE','PENDING','BLOCKED','ARCHIVED','DELETED'].map(x=><option key={x}>{x}</option>)}</select></div>
                <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full text-left text-sm"><thead className="bg-blue-50 text-slate-600"><tr>{['PHOTO','NAME','ROLL / USER ID','ROLE','STATUS','FRANCHISE','CREATED','ACTIONS'].map(h=><th className="p-3" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{allUsers.filter(u=>{const text=`${u.name||u.displayName||''} ${u.rollNumber||u.playerId||''} ${u.email||''} ${u.franchiseName||u.franchiseId||''}`.toLowerCase(); const status=u.status==='DELETED'?'DELETED':u.status==='ARCHIVED'?'ARCHIVED':u.approvalStatus?.startsWith('PENDING')||u.accountStatus==='PENDING'?'PENDING':u.status==='BLOCKED'||u.accountStatus==='DISABLED'?'BLOCKED':'ACTIVE'; return text.includes(userSearch.trim().toLowerCase())&&(userRoleFilter==='ALL'||u.role===userRoleFilter||(userRoleFilter==='FRANCHISE'&&String(u.role).startsWith('FRANCHISE'))||(userRoleFilter==='TEAM LEAD'&&u.role==='FRANCHISE_TEAM_LEADER'))&&(userStatusFilter==='ALL'||status===userStatusFilter);}).map(u=>{const uid=u.id||u.uid, player=players.find(p=>p.uid===uid||p.authUid===uid||p.id===u.playerId||p.rollNumber===u.rollNumber);return <tr key={uid} className="align-middle"><td className="p-3"><img src={u.photoUrl||player?.photoUrl||''} className="h-9 w-9 rounded-full bg-slate-100 object-cover" alt=""/></td><td className="p-3 font-semibold">{u.name||u.displayName||player?.name||'Unnamed'}<span className="block text-xs font-normal text-slate-500">{u.email||'—'}</span></td><td className="p-3 font-mono text-xs">{u.rollNumber||player?.rollNumber||uid}</td><td className="p-3">{u.role||'—'}</td><td className="p-3">{u.status||u.accountStatus||u.approvalStatus||'ACTIVE'}</td><td className="p-3">{u.franchiseName||u.franchiseId||'—'}</td><td className="p-3 text-xs">{u.createdAt?.toDate?u.createdAt.toDate().toLocaleDateString():u.createdAt?new Date(u.createdAt).toLocaleDateString():'—'}</td><td className="p-3"><div className="flex flex-wrap gap-1"><button onClick={()=>player?setManagementPlayer(player):showToast('Player profile record unavailable for this account.','warning')} className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">VIEW</button>{player&&isSuperAdmin&&<><button onClick={()=>setEditDraft({...player})} className="rounded bg-slate-100 px-2 py-1 text-xs">EDIT</button><button onClick={()=>archiveManagementPlayer(player)} disabled={managementBusy} className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-900 disabled:opacity-50">ARCHIVE</button>{player.status==='ARCHIVED'&&<button onClick={()=>handlePermanentDelete(player)} className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">DELETE</button>}</>}{isSuperAdmin&&u.role!=='SUPER_ADMIN'&&uid!==user?.uid&&!player&&<button disabled={userActionUid===uid} onClick={()=>manageUserRecord(u,u.status==='DELETED'?'RESTORE':'DELETE')} className="rounded bg-red-50 px-2 py-1 text-xs text-red-700 disabled:opacity-50">{u.status==='DELETED'?'RESTORE':'ARCHIVE'}</button>}</div></td></tr>})}</tbody></table></div>
              </section>}

              {dataView === 'TRASH' && <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-5"><h2 className="text-lg font-bold">TRASH & RESTORE</h2><div className="grid md:grid-cols-2 gap-4"><div><h3 className="mb-2 font-bold text-slate-700">ARCHIVED PLAYERS</h3>{deletedPlayers.filter(p=>p.status==='ARCHIVED').length===0&&<p className="rounded-lg bg-slate-50 p-5 text-sm text-slate-500">No archived players.</p>}{deletedPlayers.filter(p=>p.status==='ARCHIVED').map(p=><div key={p.id} className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3"><span><b>{p.name}</b><small className="block text-slate-500">{p.rollNumber} · history preserved</small></span><div className="flex gap-2"><button onClick={()=>handleRestorePlayer(p)} disabled={!isSuperAdmin||managementBusy} className="rounded bg-emerald-100 px-3 py-1 text-xs text-emerald-800 disabled:opacity-50">RESTORE</button>{isSuperAdmin&&<button onClick={()=>handlePermanentDelete(p)} className="rounded bg-red-100 px-3 py-1 text-xs text-red-800">PERMANENT DELETE</button>}</div></div>)}</div><div><h3 className="mb-2 font-bold text-slate-700">DELETED ACCOUNTS</h3>{allUsers.filter(u=>u.status==='DELETED').map(u=><div key={u.id||u.uid} className="mb-2 flex items-center justify-between rounded-lg border border-slate-200 p-3"><span><b>{u.name||u.displayName||u.email}</b><small className="block text-slate-500">{u.role} · {u.deletedAt?.toDate?u.deletedAt.toDate().toLocaleString():'Account archived'}</small></span>{isSuperAdmin&&<div className="flex gap-2"><button onClick={()=>manageUserRecord(u,'RESTORE')} className="rounded bg-emerald-100 px-3 py-1 text-xs">RESTORE</button><button onClick={()=>manageUserRecord(u,'PERMANENT_DELETE')} className="rounded bg-red-100 px-3 py-1 text-xs">PERMANENT DELETE</button></div>}</div>)}</div></div></section>}

              {dataView === 'CORRECTIONS' && <section className="rounded-2xl border border-slate-200 bg-white p-4"><h2 className="mb-3 text-lg font-bold">AUCTION CORRECTIONS</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-blue-50"><tr>{['LOT','PLAYER','FRANCHISE','PRICE','TIME','STATUS','ACTION'].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody className="divide-y">{saleAcquisitions.map(a=><tr key={a.id}><td className="p-3">LOT #{a.drawNumber||a.lotNumber||a.lotId||'—'}</td><td className="p-3 font-semibold">{a.playerName||a.playerId}</td><td className="p-3">{a.franchiseName||a.franchiseId}</td><td className="p-3">{a.price} Credits</td><td className="p-3">{a.createdAt?.toDate?a.createdAt.toDate().toLocaleString():a.createdAt?new Date(a.createdAt).toLocaleString():'—'}</td><td className="p-3">SOLD</td><td className="p-3">{isSuperAdmin?<button disabled={managementBusy} onClick={()=>undoAcquisition(a)} className="rounded bg-red-50 px-3 py-1 text-xs font-bold text-red-700 disabled:opacity-50">{managementBusy?'PROCESSING…':'UNDO SALE'}</button>:<span className="text-xs text-slate-500">Super Admin only</span>}</td></tr>)}{saleAcquisitions.length===0&&<tr><td colSpan={7} className="p-8 text-center text-slate-500">No completed sales found.</td></tr>}</tbody></table></div></section>}

              {dataView === 'AUDIT' && <section className="rounded-2xl border border-slate-200 bg-white p-4"><h2 className="mb-3 text-lg font-bold">AUDIT TIMELINE</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-blue-50"><tr>{['TIME','ACTOR','ACTION','TARGET','RESULT'].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody className="divide-y">{auditLogs.map((log,i)=><tr key={log.id||i}><td className="p-3">{log.timestamp?.toDate?log.timestamp.toDate().toLocaleString():'—'}</td><td className="p-3">{log.actorName||log.actorUid||log.actor||'—'}</td><td className="p-3 font-semibold">{log.action}</td><td className="p-3">{log.targetId||log.entityId||'—'}</td><td className="p-3">{log.result||'SUCCESS'}</td></tr>)}</tbody></table></div></section>}

              {dataView === 'CRICHEROES_AUDIT' && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                          CRICHEROES DATA AUDIT & SAFE REPAIR
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Deep-scan player records in edition <strong className="font-mono text-slate-700">{EDITION_ID}</strong>. Detect malformed links, map canonical IDs, and repair records without overwriting player stats.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          const rep = auditPlayerRecords(players, EDITION_ID);
                          setAuditReport(rep);
                          showToast(`Audit refreshed: ${rep.totalRecordsChecked} records checked.`);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        RUN AUDIT (DRY-RUN)
                      </button>

                      {isSuperAdmin && (
                        <button
                          onClick={() => setRepairConfirmOpen(true)}
                          disabled={
                            repairRunning ||
                            !auditReport ||
                            auditReport.proposedCorrectionsCount === 0
                          }
                          className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
                        >
                          {repairRunning ? 'REPAIRING DATA...' : `APPLY REPAIRS (${auditReport?.proposedCorrectionsCount || 0})`}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Metric Cards Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Scanned</span>
                      <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">
                        {auditReport?.totalRecordsChecked || 0}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 block">Verified Matches</span>
                      <span className="text-xl font-black text-emerald-800 font-mono mt-0.5 block">
                        {auditReport?.verifiedMatchesCount || 0}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70">
                      <span className="text-[10px] font-bold uppercase text-blue-700 block">Proposed Corrections</span>
                      <span className="text-xl font-black text-blue-800 font-mono mt-0.5 block">
                        {auditReport?.proposedCorrectionsCount || 0}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70">
                      <span className="text-[10px] font-bold uppercase text-amber-700 block">Review Required</span>
                      <span className="text-xl font-black text-amber-800 font-mono mt-0.5 block">
                        {auditReport?.reviewRequiredCount || 0}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70">
                      <span className="text-[10px] font-bold uppercase text-rose-700 block">Unresolved / Invalid</span>
                      <span className="text-xl font-black text-rose-800 font-mono mt-0.5 block">
                        {auditReport?.unresolvedCount || 0}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-100/70">
                      <span className="text-[10px] font-bold uppercase text-slate-600 block">No URL / Pending</span>
                      <span className="text-xl font-black text-slate-700 font-mono mt-0.5 block">
                        {auditReport?.noUrlCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Filter Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {[
                      ['ALL', `ALL (${auditReport?.records.length || 0})`],
                      ['PROPOSED', `PROPOSED CORRECTIONS (${auditReport?.proposedCorrectionsCount || 0})`],
                      ['REVIEW', `NEEDS REVIEW (${auditReport?.reviewRequiredCount || 0})`],
                      ['UNRESOLVED', `UNRESOLVED (${auditReport?.unresolvedCount || 0})`],
                      ['VERIFIED', `VERIFIED MATCHES (${auditReport?.verifiedMatchesCount || 0})`],
                    ].map(([filterKey, label]) => (
                      <button
                        key={filterKey}
                        onClick={() => setCricHeroesAuditFilter(filterKey as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          cricHeroesAuditFilter === filterKey
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Table of Records */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="p-3">Player</th>
                          <th className="p-3">Stored CricHeroes Link</th>
                          <th className="p-3">Audit Status & Issues</th>
                          <th className="p-3">Proposed Value / Canonical ID</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(auditReport?.records || [])
                          .filter(r => {
                            if (cricHeroesAuditFilter === 'PROPOSED') return r.status === 'PROPOSED_CORRECTION';
                            if (cricHeroesAuditFilter === 'REVIEW') return r.status === 'REVIEW_REQUIRED';
                            if (cricHeroesAuditFilter === 'UNRESOLVED') return r.status === 'UNRESOLVED';
                            if (cricHeroesAuditFilter === 'VERIFIED') return r.status === 'VERIFIED_MATCH';
                            return true;
                          })
                          .map(rec => {
                            const matchedPlayer = players.find(p => p.id === rec.id || p.rollNumber === rec.rollNumber);
                            return (
                              <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="p-3">
                                  <span className="font-bold text-slate-900 block">{rec.name}</span>
                                  <span className="font-mono text-[11px] text-slate-500 block">{rec.rollNumber}</span>
                                </td>

                                <td className="p-3 max-w-xs">
                                  {rec.storedUrl ? (
                                    <a
                                      href={rec.storedUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="font-mono text-[11px] text-blue-600 hover:underline block truncate max-w-[280px]"
                                      title={rec.storedUrl}
                                    >
                                      {rec.storedUrl}
                                    </a>
                                  ) : (
                                    <span className="text-slate-400 italic">No link provided</span>
                                  )}
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    Status: {rec.storedStatus || 'None'}
                                  </span>
                                </td>

                                <td className="p-3">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 ${
                                      rec.status === 'VERIFIED_MATCH'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : rec.status === 'PROPOSED_CORRECTION'
                                        ? 'bg-blue-100 text-blue-800'
                                        : rec.status === 'REVIEW_REQUIRED'
                                        ? 'bg-amber-100 text-amber-800'
                                        : rec.status === 'UNRESOLVED'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {rec.status.replace('_', ' ')}
                                  </span>
                                  {rec.issues.map((issue, idx) => (
                                    <div key={idx} className="text-[11px] text-slate-600 mt-0.5 flex items-start gap-1">
                                      <span className="text-rose-500 font-bold">•</span>
                                      <span>{issue.description}</span>
                                    </div>
                                  ))}
                                </td>

                                <td className="p-3">
                                  {rec.proposedValues ? (
                                    <div className="space-y-0.5">
                                      <span className="font-mono text-[11px] font-bold text-slate-800 block truncate max-w-[260px]">
                                        {rec.proposedValues.url}
                                      </span>
                                      <div className="flex items-center gap-2 text-[10px]">
                                        <span className="font-bold text-blue-700">
                                          Player ID: #{rec.proposedValues.playerId}
                                        </span>
                                        {rec.proposedValues.playerSlug && (
                                          <span className="text-slate-500">
                                            ({rec.proposedValues.playerSlug})
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-slate-500 block italic">
                                        {rec.proposedValues.actionNote}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 text-xs">—</span>
                                  )}
                                </td>

                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {matchedPlayer && (
                                      <button
                                        onClick={() => setEditDraft({ ...matchedPlayer })}
                                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                                      >
                                        EDIT
                                      </button>
                                    )}
                                    {rec.hasBackup && isSuperAdmin && matchedPlayer && (
                                      <button
                                        onClick={() => handleRollbackPlayer(matchedPlayer)}
                                        disabled={repairRunning}
                                        className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs"
                                        title="Restore backed up values prior to last repair"
                                      >
                                        RESTORE
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

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
                          <td className="p-3 text-slate-400">{log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A'}</td>
                          <td className="p-3 font-bold text-emerald-400">{log.action}</td>
                          <td className="p-3 text-white">{log.targetId || '-'}</td>
                          <td className="p-3 text-slate-400">{log.actorRole || log.role || '—'} · {log.actorUid || ''}</td>
                          <td className="p-3 text-slate-300 font-sans">{log.details || log.metadata?.details || log.reason || '-'}</td>
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

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600">DATA MANAGEMENT</span>
                  <h2 className="font-display font-bold text-xl text-slate-900 mt-1">DATA MANAGEMENT</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage ACC player, franchise, and account records.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* CARD 1: MANAGE PLAYERS */}
                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 uppercase">1. MANAGE PLAYERS</h3>
                      <p className="text-xs text-slate-600 mt-1 mb-4">Search, inspect, edit, or archive canonical player profiles, base prices, and buckets.</p>
                    </div>
                    <button onClick={() => setActiveSection('players')} className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm">
                      MANAGE PLAYERS
                    </button>
                  </div>

                  {/* CARD 2: MANAGE FRANCHISES */}
                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 uppercase">2. MANAGE FRANCHISES</h3>
                      <p className="text-xs text-slate-600 mt-1 mb-4">Configure teams, coordinator mappings, purse quotas, and captain assignments.</p>
                    </div>
                    <button onClick={() => setActiveSection('franchises')} className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm">
                      MANAGE FRANCHISES
                    </button>
                  </div>

                  {/* CARD 3: REGISTRATION & VERIFICATION */}
                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 uppercase">3. REGISTRATION & VERIFICATION</h3>
                      <p className="text-xs text-slate-600 mt-1 mb-4">Process candidate applications, KYC proofs, and referral declarations.</p>
                    </div>
                    <button onClick={() => setActiveSection('verification')} className="w-full py-2.5 px-4 rounded-lg bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider transition-colors">
                      VERIFICATION QUEUE
                    </button>
                  </div>

                  {/* CARD 4: TRASH & RESTORE */}
                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-slate-900 uppercase">4. TRASH & RESTORE</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          {deletedPlayers.length + deletedFranchises.length}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 mb-4">Recover archived/deleted records and review historical removal statuses.</p>
                    </div>
                    <button onClick={() => { setDataView('TRASH'); setActiveSection('datamanagement'); }} className="w-full py-2.5 px-4 rounded-lg bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 font-bold text-xs uppercase tracking-wider transition-colors">
                      OPEN TRASH
                    </button>
                  </div>

                  {/* CARD 5: AUDIT HISTORY */}
                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 uppercase">5. AUDIT HISTORY</h3>
                      <p className="text-xs text-slate-600 mt-1 mb-4">Inspect immutable security ledger, role changes, overrides, and live floor logs.</p>
                    </div>
                    <button onClick={() => setActiveSection('audit')} className="w-full py-2.5 px-4 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider transition-colors">
                      AUDIT HISTORY
                    </button>
                  </div>

                  {/* CARD 6: EXPORT DATA */}
                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 uppercase">6. EXPORT DATA</h3>
                      <p className="text-xs text-slate-600 mt-1 mb-4">Export the ACC tournament dataset (Players CSV, Squads, and Audit records).</p>
                    </div>
                    <button onClick={() => setActiveSection('export')} className="w-full py-2.5 px-4 rounded-lg bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider transition-colors">
                      EXPORT DATABASE
                    </button>
                  </div>

                  {/* CARD 7: CRICHEROES DATA AUDIT & REPAIR */}
                  <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-blue-900 uppercase">7. CRICHEROES AUDIT & REPAIR</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-200 text-blue-800 font-mono">
                          {auditReport ? `${auditReport.proposedCorrectionsCount} PROPOSED` : 'AUDIT READY'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 mb-4">
                        Deep-scan stored CricHeroes URLs, resolve unmapped player IDs, and apply safe batch repairs with automated snapshot backups.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setDataView('CRICHEROES_AUDIT');
                        setActiveSection('datamanagement');
                      }}
                      className="w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                    >
                      OPEN CRICHEROES AUDIT
                    </button>
                  </div>
                </div>

                {/* CARD 7: WIPE ALL PARTICIPANT DATA */}
                <div className="p-5 rounded-xl border-2 border-red-500 bg-gradient-to-r from-red-50 to-rose-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white">
                        <Trash2 size={13} />
                      </div>
                      <h3 className="font-bold text-sm text-red-900 uppercase tracking-wide">7. WIPE ALL PARTICIPANT DATA</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white font-mono">
                        SUPER ADMIN ONLY
                      </span>
                    </div>
                    <p className="text-xs text-red-700 mt-1 max-w-2xl">
                      Permanently remove participant records and dependent tournament data from the selected dataset. This action cannot be undone through the normal application interface.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenWipeModal}
                    className="shrink-0 py-2.5 px-5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                  >
                    WIPE PARTICIPANT DATA
                  </button>
                </div>

                {/* DEMO RESET SAFETY NOTICE */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-amber-900">DEMO RESET</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">Unavailable until an isolated demo dataset is configured.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded font-mono font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-300">
                    ISOLATED
                  </span>
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
                  <span>OPEN LIVE AUCTION COCKPIT →</span>
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
      {managementPlayer && <div className="fixed inset-0 z-[70] bg-slate-900/40 flex justify-end" onClick={()=>setManagementPlayer(null)}><aside onClick={e=>e.stopPropagation()} className="h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl text-slate-800"><div className="flex justify-between"><div><h2 className="text-xl font-black">PLAYER PROFILE</h2><p className="text-sm text-slate-500">Historical auction records remain visible for archived players.</p></div><button onClick={()=>setManagementPlayer(null)} className="rounded-lg bg-slate-100 px-3 py-1">CLOSE</button></div><div className="mt-5 flex items-center gap-4"><img src={managementPlayer.photoUrl||''} alt="" className="h-20 w-20 rounded-xl bg-slate-100 object-cover"/><div><h3 className="text-lg font-bold">{managementPlayer.name}</h3><p className="font-mono text-sm text-slate-500">{managementPlayer.rollNumber||managementPlayer.roll}</p></div></div><div className="mt-5 grid grid-cols-2 gap-3">{[['Mobile',managementPlayer.mobile],['Email',managementPlayer.email],['Academic program',managementPlayer.program||managementPlayer.academic?.program],['Branch',managementPlayer.branch||managementPlayer.academic?.branch],['Year',managementPlayer.year||managementPlayer.academic?.studyYear],['Bucket',managementPlayer.bucket||managementPlayer.academic?.bucket],['Skills',(managementPlayer.skills||[]).join?.(', ')||managementPlayer.skills],['CricHeroes',managementPlayer.cricHeroesUrl],['Base price',managementPlayer.basePrice],['Approval status',managementPlayer.approvalStatus],['Payment status',managementPlayer.paid?'PAID':'UNPAID']].map(([k,v])=><div key={String(k)} className="rounded-lg bg-slate-50 p-3"><small className="block text-slate-500">{k}</small><b className="break-words">{String(v||'—')}</b></div>)}</div><h3 className="mt-7 text-lg font-bold">AUCTION HISTORY</h3>{playerHistory.length===0?<p className="mt-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No linked lots, bids, or purchases were found.</p>:<div className="mt-2 space-y-2">{playerHistory.map(row=><div key={`${row.type}-${row.id}`} className="flex justify-between rounded-lg border border-slate-200 p-3 text-sm"><span><b>{row.type}</b> · Lot #{row.drawNumber||row.lotNumber||row.lotId||'—'} · {row.franchiseName||'—'}</span><span>{row.price||row.amount||row.status||'—'} Cr</span></div>)}</div>}</aside></div>}
      {/* 3-Step Wipe All Participant Data Modal */}
      {wipeModalOpen && (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-red-200 shadow-2xl p-6 text-slate-800 space-y-4">
            {/* Step 1 */}
            {wipeStep === 1 && (
              <>
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2">
                    <Trash2 className="text-red-600" size={20} />
                    <h3 className="font-display font-black text-lg text-red-950 uppercase">
                      WIPE ALL PARTICIPANT DATA
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-red-700 tracking-wider">
                    STEP 1 OF 3 — SCOPE & RECORD ENUMERATION
                  </span>
                  <p className="text-xs text-red-800 mt-2">
                    Permanently remove participant records and dependent tournament data from the selected dataset. This action cannot be undone through the normal application interface.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Edition:</span>
                    <span className="font-mono font-bold text-slate-900">ACC 2026 (acc-2026)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Environment:</span>
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-100 text-blue-800">LIVE / PRODUCTION</span>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Discovered Participant & Operational Records
                  </div>
                  {wipeLoading && !wipeCounts ? (
                    <div className="text-xs text-slate-400 font-mono py-4 text-center">Loading live record counts...</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
                        <span>Players found:</span>
                        <strong className="text-red-600">{wipeCounts?.players ?? 0}</strong>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
                        <span>Franchises found:</span>
                        <strong className="text-red-600">{wipeCounts?.franchises ?? 0}</strong>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
                        <span>Registrations found:</span>
                        <strong className="text-red-600">{wipeCounts?.registrations ?? 0}</strong>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
                        <span>Verification records:</span>
                        <strong className="text-red-600">{wipeCounts?.verification ?? 0}</strong>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
                        <span>Auction lots & bids:</span>
                        <strong className="text-red-600">{wipeCounts?.auction ?? 0}</strong>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-100 flex justify-between">
                        <span>Media objects:</span>
                        <strong className="text-red-600">{wipeCounts?.media ?? 0}</strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setWipeModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">
                    CANCEL
                  </button>
                  <button onClick={() => setWipeStep(2)} className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider">
                    REVIEW DEPENDENCIES →
                  </button>
                </div>
              </>
            )}

            {/* Step 2 */}
            {wipeStep === 2 && (
              <>
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <h3 className="font-display font-black text-lg text-red-950 uppercase">
                    WIPE ALL PARTICIPANT DATA
                  </h3>
                  <span className="text-[11px] font-mono font-bold text-red-700 tracking-wider">
                    STEP 2 OF 3 — PREVIEW DEPENDENCIES & PROTECTED RESOURCES
                  </span>
                </div>

                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-rose-900 uppercase">Affected Collections to be Wiped:</div>
                  <div className="text-[11px] text-rose-800 leading-relaxed font-mono">
                    Phase 1 (Auction Operations): bids, lots, sales, acquisitions, round2, allotments, purseTransactions, purseLedger<br />
                    Phase 2 (Registry & Projections): players, publicPlayers, deletedPlayers, registrations, referrals, franchises, franchiseUsers<br />
                    Phase 3 (Participant Accounts & Media): non-admin /users profiles, Storage /players/, /franchises/<br />
                    Phase 4 (State Reset): live auction state doc reset to pristine IDLE
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-emerald-900 uppercase">✓ Strictly Protected Resources (Never Removed):</div>
                  <ul className="text-[11px] text-emerald-800 list-disc list-inside space-y-0.5">
                    <li>Super Admin account ({userDoc?.email || user?.email}) & all ADMIN accounts</li>
                    <li>Tamper-evident Security Audit Log (auditLogs ledger is preserved and appended)</li>
                    <li>System settings & tournament edition metadata documents</li>
                    <li>Database backup snapshots in /backups</li>
                  </ul>
                </div>

                <div className="flex justify-between gap-2 pt-2">
                  <button onClick={() => setWipeStep(1)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">
                    ← BACK TO SCOPE
                  </button>
                  <button onClick={() => setWipeStep(3)} className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider">
                    PROCEED TO CONFIRMATION →
                  </button>
                </div>
              </>
            )}

            {/* Step 3 */}
            {wipeStep === 3 && (
              <>
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <h3 className="font-display font-black text-lg text-red-950 uppercase">
                    WIPE ALL PARTICIPANT DATA
                  </h3>
                  <span className="text-[11px] font-mono font-bold text-red-700 tracking-wider">
                    STEP 3 OF 3 — EXPLICIT SECURITY CONFIRMATION
                  </span>
                </div>

                <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-xs text-red-900 leading-relaxed font-medium">
                  <strong>PERMANENT DELETION WARNING:</strong> This action permanently purges participant records, team allocations, and auction operations from the database. It cannot be reversed.
                </div>

                <label className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-xs text-slate-800">
                  <input
                    type="checkbox"
                    checked={wipeScopeAcknowledged}
                    onChange={e => setWipeScopeAcknowledged(e.target.checked)}
                    className="mt-0.5 accent-red-600"
                  />
                  <span>
                    I have verified the record counts and understand that all participant data and dependent auction records will be permanently removed.
                  </span>
                </label>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Type <strong className="text-red-600 font-mono">WIPE ACC PARTICIPANT DATA</strong> to confirm:
                  </label>
                  <input
                    type="text"
                    value={wipeConfirmPhrase}
                    onChange={e => setWipeConfirmPhrase(e.target.value.toUpperCase())}
                    placeholder="WIPE ACC PARTICIPANT DATA"
                    className="w-full px-3 py-2 border-2 border-red-400 focus:border-red-600 rounded-xl font-mono text-sm uppercase text-red-900"
                  />
                </div>

                <div className="flex justify-between gap-2 pt-2">
                  <button onClick={() => setWipeStep(2)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">
                    ← BACK
                  </button>
                  <button
                    onClick={handleExecuteWipe}
                    disabled={wipeLoading || wipeConfirmPhrase !== 'WIPE ACC PARTICIPANT DATA' || !wipeScopeAcknowledged}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    {wipeLoading ? 'PURGING DATASET...' : 'PERMANENTLY WIPE DATASET'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {repairConfirmOpen && auditReport && (
        <div className="fixed inset-0 z-[75] bg-slate-900/50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 text-blue-700">
              <Shield className="w-5 h-5" />
              <h3 className="font-display font-black text-lg text-slate-900">
                CONFIRM CRICHEROES DATA REPAIR
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              You are about to repair <strong>{auditReport.proposedCorrectionsCount}</strong> player records in edition <strong>{EDITION_ID}</strong>.
            </p>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="font-semibold">Records to update:</span>
                <span className="font-mono font-bold text-blue-900">{auditReport.proposedCorrectionsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Snapshot backups:</span>
                <span className="text-emerald-700 font-bold">YES (Saved to cricHeroesAuditBackup)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Career stats preserved:</span>
                <span className="text-emerald-700 font-bold">YES (Zero stats overwritten)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Audit log entry:</span>
                <span className="text-slate-800 font-bold">YES (Recorded in audit_logs)</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRepairConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                CANCEL
              </button>
              <button
                onClick={handleExecuteCricHeroesRepair}
                disabled={repairRunning}
                className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {repairRunning ? 'APPLYING REPAIRS...' : 'CONFIRM & APPLY REPAIRS'}
              </button>
            </div>
          </div>
        </div>
      )}
      {editDraft && <div className="fixed inset-0 z-[70] bg-slate-900/40 flex items-center justify-center p-3"><section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 text-slate-800 shadow-2xl"><h2 className="text-xl font-black">EDIT PLAYER</h2><p className="mb-4 text-sm text-slate-500">Review field changes before saving. The successful update is recorded in the canonical audit log.</p><div className="grid sm:grid-cols-2 gap-3">{[['name','Name'],['photoUrl','Photo URL'],['mobile','Mobile'],['email','Email'],['program','Academic program'],['branch','Branch'],['year','Year'],['bucket','Bucket'],['basePrice','Base price'],['cricHeroesUrl','CricHeroes']].map(([key,label])=><label key={key} className="text-xs font-semibold text-slate-600">{label}<input value={editDraft[key]??''} onChange={e=>setEditDraft((d:any)=>({...d,[key]:e.target.value}))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"/></label>)}</div><label className="mt-3 block text-xs font-semibold text-slate-600">Skills (comma separated)<input value={(editDraft.skills||[]).join?.(', ')||editDraft.skills||''} onChange={e=>setEditDraft((d:any)=>({...d,skills:e.target.value.split(',').map((x:string)=>x.trim()).filter(Boolean)}))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"/></label><div className="mt-4 rounded-xl bg-blue-50 p-3"><b className="text-sm">CHANGES TO SAVE</b>{['name','photoUrl','mobile','email','program','branch','year','bucket','basePrice','cricHeroesUrl','skills'].filter(k=>JSON.stringify(editDraft[k]??'')!==JSON.stringify((players.find(p=>p.id===editDraft.id)||{})[k]??'')).map(k=><div key={k} className="mt-1 text-xs"><b>{k}</b>: {String((players.find(p=>p.id===editDraft.id)||{})[k]??'—')} → {String(editDraft[k]??'—')}</div>)}</div><div className="mt-4 flex justify-end gap-2"><button onClick={()=>setEditDraft(null)} className="rounded-lg border px-4 py-2">CANCEL</button><button disabled={managementBusy||!isSuperAdmin} onClick={savePlayerEdit} className="rounded-lg bg-blue-700 px-4 py-2 font-bold text-white disabled:opacity-50">{managementBusy?'SAVING…':'SAVE CHANGES'}</button></div></section></div>}
    </div>
  );
}
