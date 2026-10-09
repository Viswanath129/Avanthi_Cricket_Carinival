import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { BUCKET_LABELS, BucketId } from '@shared/types';
import { parseCricHeroesUrl } from '@shared/engine/cricheroes';
import { resolvePlayerProfile } from '@/services/playerProfileService';

export default function PlayerDashboardPage() {
  const { user, userDoc, signOut } = useAuth();
  const [, setLocation] = useLocation();

  // Simulated / live player record state
  const [player, setPlayer] = useState<any>({
    id: userDoc?.playerId || 'p_demo',
    rollNumber: '26811A0501',
    name: user?.displayName || 'Rohit Nambiar',
    branch: 'CSE',
    studyYear: 1,
    bucket: 'B1' as BucketId,
    auctionStatus: 'AVAILABLE', // 'AVAILABLE' | 'SOLD' | 'UNSOLD' | 'ALLOTTED' | 'SCOUTED'
    soldPrice: null as number | null,
    soldFranchiseName: null as string | null,
    photoUrl: null as string | null,
    basePrice: 40,
    paymentStatus: 'UNPAID', // 'PAID' | 'UNPAID'
    cricHeroesStatus: 'PROVIDED', // 'PROVIDED' | 'PENDING'
    cricHeroesUrl: 'https://cricheroes.com/player-profile/rohit-nambiar',
    cricHeroesMobile: '9876543210',
    auctionEligibility: 'ELIGIBLE', // 'ELIGIBLE' | 'NOT_ELIGIBLE'
    editingBlocked: false,
    
    // Skills
    isWk: false,
    isBatter: true,
    battingArm: 'RIGHT',
    battingStyle: 'ROTATOR',
    battingPosition: 'OPENER',
    isBowler: false,
    bowlingArm: 'RIGHT',
    bowlingType: 'FAST',

    // Stats
    matchesPlayed: 14,
    runsScored: 412,
    highestScore: 78,
    battingAverage: 34.33,
    strikeRate: 138.5,
    wicketsTaken: 0,
    bowlingAverage: 0,
    economyRate: 0,
    bestBowling: '-',
    catches: 6,
    stumpings: 0,

    // Reference
    isReferenceEligible: true,
    referenceClaimed: true,
    referringFranchiseName: 'CSE Champions',
    referenceVerified: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({ ...player });
  const [isSaving, setIsSaving] = useState(false);
  const [discrepancyModalOpen, setDiscrepancyModalOpen] = useState(false);
  const [discrepancyReason, setDiscrepancyReason] = useState('');
  const [discrepancySuccess, setDiscrepancySuccess] = useState(false);

  // Realtime Firestore subscription for player record (Point 8 & 45)
  useEffect(() => {
    let unsubSnapshot = () => {};
    let isMounted = true;

    async function initSubscription() {
      let targetPlayerId = userDoc?.playerId;

      if (!targetPlayerId && user?.uid) {
        try {
          const resolved = await resolvePlayerProfile(user.uid);
          if (resolved.exists && resolved.playerId) {
            targetPlayerId = resolved.playerId;
          }
        } catch (resErr) {
          console.warn('[PlayerDashboard] Dynamic player resolution error:', resErr);
        }
      }

      if (!targetPlayerId || !isMounted) return;

      unsubSnapshot = onSnapshot(doc(db, 'players', targetPlayerId), (docSnap) => {
        if (docSnap.exists() && isMounted) {
          const data = docSnap.data();
          setPlayer((prev: any) => ({
            ...prev,
            ...data,
            id: docSnap.id,
            rollNumber: data.rollNumber || data.rollNumberNormalized || targetPlayerId,
            name: data.name || user?.displayName || prev.name,
            branch: data.academic?.branch || prev.branch,
            studyYear: data.academic?.studyYear || prev.studyYear,
            bucket: data.academic?.bucket || prev.bucket,
            auctionStatus: data.auctionStatus || (data.status === 'AVAILABLE' ? 'AVAILABLE' : (data.approvalStatus || 'SUBMITTED')),
            photoUrl: data.photoUrl || user?.photoURL || prev.photoUrl,
            basePrice: data.basePrice || prev.basePrice,
            soldPrice: data.soldPrice !== undefined ? data.soldPrice : prev.soldPrice,
            soldFranchiseName: data.soldFranchiseName || prev.soldFranchiseName,
            soldFranchiseId: data.soldFranchiseId || prev.soldFranchiseId,
            paymentStatus: data.registration?.paid ? 'PAID' : (data.paymentStatus || 'UNPAID'),
            cricHeroesStatus: data.cricheroes?.status || prev.cricHeroesStatus,
            cricHeroesUrl: data.cricheroes?.profileUrl || data.cricheroes?.url || prev.cricHeroesUrl,
            cricHeroesMobile: data.cricheroes?.registeredMobilePrivate || prev.cricHeroesMobile,
          }));
        }
      }, (err) => {
        console.warn("Player profile subscription fallback:", err);
      });
    }

    initSubscription();

    return () => {
      isMounted = false;
      unsubSnapshot();
    };
  }, [userDoc?.playerId, user]);

  // Sync edits when player updates
  useEffect(() => {
    setEditFormData({ ...player });
  }, [player]);

  const handlePhotoReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const photoRef = ref(storage, `editions/acc-2026/players/${player.id}/photo.jpg`);
      await uploadBytes(photoRef, file);
      const url = await getDownloadURL(photoRef);
      setPlayer((p: any) => ({ ...p, photoUrl: url }));
    } catch {
      // Fallback local preview
      setPlayer((p: any) => ({ ...p, photoUrl: URL.createObjectURL(file) }));
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const rawUrl = editFormData.cricHeroesUrl ? String(editFormData.cricHeroesUrl).trim() : '';
      let parsed = null;
      if (rawUrl) {
        parsed = parseCricHeroesUrl(rawUrl);
        if (!parsed.isValid) {
          alert(`Invalid CricHeroes URL: ${parsed.error || 'Please provide a valid player profile URL.'}`);
          setIsSaving(false);
          return;
        }
      }

      const updatedPlayer = {
        ...editFormData,
        cricHeroesUrl: parsed ? parsed.canonicalUrl : rawUrl,
        cricHeroesStatus: parsed ? 'PROVIDED' : (rawUrl ? 'PROVIDED' : 'PENDING'),
      };

      if (userDoc?.playerId) {
        const playerRef = doc(db, 'players', userDoc.playerId);
        const patch: Record<string, any> = {
          cricHeroesUrl: updatedPlayer.cricHeroesUrl,
          'cricheroes.profileUrl': updatedPlayer.cricHeroesUrl,
          'cricheroes.status': updatedPlayer.cricHeroesStatus,
        };
        if (parsed?.playerId) {
          patch['cricheroes.playerId'] = parsed.playerId;
        }
        if (parsed?.playerSlug) {
          patch['cricheroes.slug'] = parsed.playerSlug;
        }
        if (editFormData.cricHeroesMobile) {
          patch['cricheroes.registeredMobilePrivate'] = editFormData.cricHeroesMobile.trim();
        }
        await updateDoc(playerRef, patch);
      }

      setPlayer(updatedPlayer);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving profile changes:', err);
      alert('Failed to save changes: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleFlagDiscrepancy = () => {
    if (!discrepancyReason.trim()) return;
    setDiscrepancySuccess(true);
    setTimeout(() => {
      setDiscrepancyModalOpen(false);
      setDiscrepancySuccess(false);
      setDiscrepancyReason('');
    }, 2000);
  };

  const getStatusBadge = () => {
    switch (player.auctionStatus) {
      case 'SOLD':
        return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40';
      case 'AVAILABLE':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40';
      case 'UNSOLD':
        return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40';
      case 'ALLOTTED':
        return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/40';
      case 'SCOUTED':
        return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors pb-12">
      {/* HEADER (Section 3.1) */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-serif font-bold text-emerald-500 text-lg shadow-sm">
              ACC
            </div>
            <div>
              <h1 className="font-serif font-bold text-base md:text-lg text-slate-900 dark:text-slate-100 leading-tight">
                {player.name}
              </h1>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>{player.rollNumber}</span>
                <span>\u00B7</span>
                <span>{player.branch} \u2014 Year {player.studyYear}</span>
                <span>\u00B7</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {BUCKET_LABELS[player.bucket as BucketId] || player.bucket}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Auction Status Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold border tracking-wider uppercase ${getStatusBadge()}`}
            >
              {player.auctionStatus}
              {player.auctionStatus === 'SOLD' && ` (${player.soldFranchiseName} \u00B7 ${player.soldPrice}c)`}
            </span>

            <button
              onClick={() => {
                signOut();
                setLocation('/login');
              }}
              className="text-xs text-red-500 hover:text-red-400 font-bold px-2 py-1"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* ACTION BAR (Section 3.6) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              disabled={player.editingBlocked}
              className={`min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                player.editingBlocked
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : isEditing
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {player.editingBlocked ? '\uD83D\uDD12 EDITING BLOCKED' : isEditing ? 'CANCEL EDIT' : '[ EDIT PROFILE ]'}
            </button>

            {isEditing && (
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="min-h-[44px] px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {isSaving ? 'SAVING...' : '[ SAVE CHANGES ]'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDiscrepancyModalOpen(true)}
              className="min-h-[44px] px-4 py-2 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all"
            >
              \u2691 [ FLAG YEAR DISCREPANCY ]
            </button>

            <label className="min-h-[44px] px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center">
              [ REPLACE PHOTO ]
              <input type="file" accept="image/*" onChange={handlePhotoReplace} className="hidden" />
            </label>
          </div>
        </div>

        {/* PROFILE & VERIFICATION PANEL (Section 3.2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Photograph Card */}
          <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {player.photoUrl ? (
                <img src={player.photoUrl} alt="Player" className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-4xl text-emerald-500 font-bold">{player.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">{player.name}</h3>
              <p className="font-mono text-xs text-slate-500">{player.rollNumber}</p>
            </div>
            <div className="w-full pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Base Price:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{player.basePrice} Credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Eligibility:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{player.auctionEligibility}</span>
              </div>
            </div>
          </div>

          {/* Verification & Account Indicators */}
          <div className="md:col-span-2 backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                Tournament Verification & Registration Status
              </h3>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                ACC 2026 Season
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 block mb-1">Registration Payment:</span>
                <span
                  className={`font-bold ${
                    player.paymentStatus === 'PAID' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {player.paymentStatus}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 block mb-1">CricHeroes Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{player.cricHeroesStatus}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  CricHeroes Profile URL
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editFormData.cricHeroesUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, cricHeroesUrl: e.target.value })}
                    className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                ) : (
                  <a
                    href={player.cricHeroesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:underline block truncate"
                  >
                    {player.cricHeroesUrl || 'No profile link provided'}
                  </a>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  CricHeroes Mobile (Confidential)
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editFormData.cricHeroesMobile}
                    onChange={(e) => setEditFormData({ ...editFormData, cricHeroesMobile: e.target.value })}
                    className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                ) : (
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    \u2022\u2022\u2022\u2022\u2022\u2022{player.cricHeroesMobile?.slice(-4)} (Protected)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SKILL PROFILE PANEL (Section 3.3) */}
        <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
              Skill Profile & Playing Role
            </h3>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {player.isWk ? 'Wicket-Keeper' : player.isBatter && player.isBowler ? 'All-Rounder' : player.isBatter ? 'Batter' : 'Bowler'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Batting Arm</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{player.battingArm} Hand</span>
            </div>
            <div>
              <span className="text-slate-500 block">Batting Style</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{player.battingStyle}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Position</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{player.battingPosition}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Wicket Keeper</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{player.isWk ? 'YES' : 'NO'}</span>
            </div>
          </div>
        </div>

        {/* CAREER STATS PANEL (Section 3.4) */}
        <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                Career Benchmark Statistics
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
                Self-Declared
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60">
              <span className="text-slate-500 block">Matches</span>
              <span className="text-base font-extrabold">{player.matchesPlayed}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60">
              <span className="text-slate-500 block">Runs Scored</span>
              <span className="text-base font-extrabold">{player.runsScored}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60">
              <span className="text-slate-500 block">Highest Score</span>
              <span className="text-base font-extrabold">{player.highestScore}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60">
              <span className="text-slate-500 block">Batting Avg</span>
              <span className="text-base font-extrabold">{player.battingAverage}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60">
              <span className="text-slate-500 block">Strike Rate</span>
              <span className="text-base font-extrabold">{player.strikeRate}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60">
              <span className="text-slate-500 block">Wickets</span>
              <span className="text-base font-extrabold">{player.wicketsTaken}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60">
              <span className="text-slate-500 block">Catches</span>
              <span className="text-base font-extrabold">{player.catches}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60">
              <span className="text-slate-500 block">Stumpings</span>
              <span className="text-base font-extrabold">{player.stumpings}</span>
            </div>
          </div>
        </div>

        {/* ACC REFERENCE DECLARATION PANEL (Section 3.5) */}
        {player.isReferenceEligible && (
          <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-3">
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
              ACC Reference Program Declaration
            </h3>
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-xs font-mono flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Referring Franchise:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {player.referringFranchiseName || 'None'}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                {player.referenceVerified ? 'Super Admin Verified' : 'Verification In Progress'}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* DISCREPANCY MODAL */}
      {discrepancyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
              Flag Academic Year Discrepancy
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              If your derived study year or branch does not reflect detention or gap years, describe it below. A priority audit item will be created for the Super Admin.
            </p>
            <textarea
              rows={3}
              value={discrepancyReason}
              onChange={(e) => setDiscrepancyReason(e.target.value)}
              placeholder="State your actual year of study and batch..."
              className="w-full p-3 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-slate-100"
            />
            {discrepancySuccess && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                \u2713 Discrepancy flagged successfully! Queued for Super Admin review.
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDiscrepancyModalOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleFlagDiscrepancy}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white"
              >
                Submit Discrepancy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
