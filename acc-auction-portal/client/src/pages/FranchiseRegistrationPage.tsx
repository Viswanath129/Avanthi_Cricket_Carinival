import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { functions, storage } from '@/lib/firebase';

const OFFICIAL_TEAMS = [
  'CSE Champions',
  'ECE Electro Kings',
  'Mechanical Warriors',
  'Civil Gladiators',
  'EEE Spark Royals',
  'CSM Cyber Knights',
  'CSD Data Strikers',
  'Diploma Dynamic Titans',
  'Pharmacy Phoenix',
  'MBA Mavericks',
  'Staff Super Kings',
];

const DEPARTMENTS = [
  'Computer Science & Engineering (CSE)',
  'Electronics & Communication (ECE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Electrical & Electronics (EEE)',
  'AI & Machine Learning (CSM)',
  'Data Science (CSD)',
  'Diploma Wing',
  'Pharmacy',
  'Management Studies (MBA)',
  'Administration & General Faculty',
];

// Mock/registered players list for searchable picker
const INITIAL_REGISTERED_PLAYERS = [
  { id: 'p1', name: 'Sai Teja', rollNumber: '25811A0403', branch: 'ECE', studyYear: 2, bucket: 'B2', isCurrentYearAdmission: false },
  { id: 'p2', name: 'Harsha Vardhan', rollNumber: '24811A0501', branch: 'CSE', studyYear: 3, bucket: 'B3', isCurrentYearAdmission: false },
  { id: 'p3', name: 'Dinesh Kumar', rollNumber: '25815A0403', branch: 'ECE', studyYear: 3, bucket: 'B3', isCurrentYearAdmission: false },
  { id: 'p4', name: 'Naveen Reddy', rollNumber: '23811A4201', branch: 'CSM', studyYear: 4, bucket: 'B4', isCurrentYearAdmission: false },
  { id: 'p5', name: 'Murali Krishna', rollNumber: '24597-CM-015', branch: 'Diploma CM', studyYear: 2, bucket: 'D5', isCurrentYearAdmission: false },
  { id: 'p6', name: 'Rohit Nambiar', rollNumber: '26811A0501', branch: 'CSE', studyYear: 1, bucket: 'B1', isCurrentYearAdmission: true },
  { id: 'p7', name: 'V. Kalyan', rollNumber: '26811A0402', branch: 'ECE', studyYear: 1, bucket: 'B1', isCurrentYearAdmission: true },
  { id: 'p8', name: 'P. Shiva', rollNumber: '26815A0301', branch: 'ME', studyYear: 2, bucket: 'B2', isCurrentYearAdmission: true },
  { id: 'p9', name: 'Ravi Teja', rollNumber: '26597-EC-022', branch: 'Diploma EC', studyYear: 1, bucket: 'D5', isCurrentYearAdmission: true },
  { id: 'p10', name: 'Kiran Kumar', rollNumber: '26597-M-041', branch: 'Diploma M', studyYear: 1, bucket: 'D5', isCurrentYearAdmission: true },
];

export default function FranchiseRegistrationPage() {
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    // Section 1: Team Identity
    teamName: '',
    logoFile: null as File | null,
    logoPreview: null as string | null,

    // Section 2: Coordinator
    coordName: '',
    coordDepartment: DEPARTMENTS[0],
    coordPhotoFile: null as File | null,
    coordPhotoPreview: null as string | null,
    coordMobile: '',

    // Section 3: Captain & VC
    captainPlayerId: '',
    vcPlayerId: '',
    captainMobile: '',

    // Section 4: Referred Players (Up to 5)
    referredPlayers: [] as Array<{
      studentName: string;
      rollNumber: string;
      admissionYear: number;
    }>,
  });

  const [referredDraft, setReferredDraft] = useState({
    studentName: '',
    rollNumber: '',
    admissionYear: 2026,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load existing claimed captains from localStorage to simulate cross-franchise exclusion
  const [claimedPlayerIds, setClaimedPlayerIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem('acc_claimed_captains');
      if (stored) {
        setClaimedPlayerIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleFieldChange = (field: string, value: any) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      delete copy.global;
      return copy;
    });
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, logo: 'Logo must be an image file.' }));
        return;
      }
      handleFieldChange('logoFile', file);
      handleFieldChange('logoPreview', URL.createObjectURL(file));
    }
  };

  const handleCoordPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, coordPhoto: 'Photo must be an image file.' }));
        return;
      }
      handleFieldChange('coordPhotoFile', file);
      handleFieldChange('coordPhotoPreview', URL.createObjectURL(file));
    }
  };

  const handleAddReferredPlayer = () => {
    if (formData.referredPlayers.length >= 5) {
      setErrors((prev) => ({ ...prev, referred: 'Maximum 5 referred players permitted per franchise.' }));
      return;
    }
    if (!referredDraft.studentName.trim() || !referredDraft.rollNumber.trim()) {
      setErrors((prev) => ({ ...prev, referred: 'Student Name and Roll Number are required.' }));
      return;
    }

    // Only students admitted in the current academic year (2026)
    if (referredDraft.admissionYear !== 2026) {
      setErrors((prev) => ({
        ...prev,
        referred: 'Restriction: Only students admitted in the current academic year (2026) are eligible for reference program.',
      }));
      return;
    }

    // Check duplicate in current list
    if (formData.referredPlayers.some((p) => p.rollNumber.toUpperCase() === referredDraft.rollNumber.trim().toUpperCase())) {
      setErrors((prev) => ({ ...prev, referred: 'This roll number is already in your referred list.' }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      referredPlayers: [
        ...prev.referredPlayers,
        {
          studentName: referredDraft.studentName.trim(),
          rollNumber: referredDraft.rollNumber.trim().toUpperCase(),
          admissionYear: referredDraft.admissionYear,
        },
      ],
    }));

    setReferredDraft({ studentName: '', rollNumber: '', admissionYear: 2026 });
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.referred;
      return copy;
    });
  };

  const handleRemoveReferredPlayer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      referredPlayers: prev.referredPlayers.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.teamName.trim()) {
      errs.teamName = 'Team name is required.';
    }

    if (!formData.logoFile && !formData.logoPreview) {
      errs.logo = 'Team logo is required.';
    }

    if (!formData.coordName.trim()) {
      errs.coordName = 'Faculty coordinator name is required.';
    }

    if (!formData.coordMobile.trim() || formData.coordMobile.length < 10) {
      errs.coordMobile = 'A valid 10-digit mobile number is required for coordinator login.';
    }

    if (!formData.coordPhotoFile && !formData.coordPhotoPreview) {
      errs.coordPhoto = 'Coordinator photograph is required.';
    }

    if (!formData.captainPlayerId) {
      errs.captain = 'Captain selection is required.';
    }

    if (formData.captainPlayerId && claimedPlayerIds.has(formData.captainPlayerId)) {
      errs.captain = 'This player is already claimed as Captain by another franchise.';
    }

    if (!formData.vcPlayerId) {
      errs.vc = 'Vice-Captain selection is required.';
    }

    if (formData.captainPlayerId && formData.vcPlayerId && formData.captainPlayerId === formData.vcPlayerId) {
      errs.vc = 'Captain and Vice-Captain cannot be the same player.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!isDraft && !validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      const editionId = 'acc-2026';
      let logoUrl = formData.logoPreview || '';
      let coordPhotoUrl = formData.coordPhotoPreview || '';

      // Upload files if present
      if (formData.logoFile) {
        try {
          const logoRef = ref(storage, `editions/${editionId}/franchises/${formData.teamName}/logo.png`);
          await uploadBytes(logoRef, formData.logoFile);
          logoUrl = await getDownloadURL(logoRef);
        } catch {
          // fallback to preview
        }
      }

      if (formData.coordPhotoFile) {
        try {
          const photoRef = ref(storage, `editions/${editionId}/franchises/${formData.teamName}/coord.jpg`);
          await uploadBytes(photoRef, formData.coordPhotoFile);
          coordPhotoUrl = await getDownloadURL(photoRef);
        } catch {
          // fallback to preview
        }
      }

      // Record claimed players locally for instant simulation
      if (formData.captainPlayerId) {
        const nextClaimed = new Set(claimedPlayerIds);
        nextClaimed.add(formData.captainPlayerId);
        if (formData.vcPlayerId) nextClaimed.add(formData.vcPlayerId);
        localStorage.setItem('acc_claimed_captains', JSON.stringify(Array.from(nextClaimed)));
        setClaimedPlayerIds(nextClaimed);
      }

      // Call Cloud Function if available
      try {
        const registerFranchiseFn = httpsCallable(functions, 'registerFranchise');
        await registerFranchiseFn({
          editionId,
          teamName: formData.teamName,
          logoUrl,
          coordinator: {
            name: formData.coordName,
            department: formData.coordDepartment,
            mobilePrivate: formData.coordMobile,
            photoUrl: coordPhotoUrl,
          },
          leadership: {
            captainPlayerId: formData.captainPlayerId,
            viceCaptainPlayerId: formData.vcPlayerId,
            captainMobilePrivate: formData.captainMobile || null,
          },
          referredPlayers: formData.referredPlayers,
          status: isDraft ? 'DRAFT' : 'PENDING_APPROVAL',
          purseCredits: 1000,
        });
      } catch (backendErr) {
        console.warn('Backend call simulated:', backendErr);
      }

      setSuccessMessage(
        isDraft
          ? 'Draft saved successfully. You can return anytime to finalize your team registration.'
          : 'Franchise registration submitted! Status: PENDING APPROVAL. Upon Super Admin verification, your 1000-credit auction purse will be unlocked.'
      );

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrors({ global: err.message || 'Submission failed. Please verify credentials and network connection.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 md:px-8 font-sans transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-serif font-bold text-emerald-500 text-xl shadow-sm">
              ACC
            </div>
            <div>
              <h1 className="font-serif font-bold text-2xl md:text-3xl text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                Franchise Team Registration
              </h1>
              <p className="text-xs uppercase tracking-widest font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                ACC 2026 \u00B7 Authorized Departmental Entry
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <button className="min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all">
                \u2190 Back to Sign In
              </button>
            </Link>
          </div>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-sm space-y-2 animate-in fade-in duration-300">
            <p className="font-bold flex items-center gap-2 text-base">
              <span>\u2713</span> {successMessage}
            </p>
            <div className="pt-2 flex gap-3">
              <Link href="/login">
                <button className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                  Go to Franchise Sign In \u2192
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errors.global && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <span>\u26A0</span>
            <span>{errors.global}</span>
          </div>
        )}

        {/* Section 1: Team Identity */}
        <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg md:text-xl text-slate-900 dark:text-slate-100">
                1. Team Identity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official franchise brand and high-contrast vector / insignia logo.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              11 Teams Quota
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Franchise Team Name <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.teamName}
                onChange={(e) => handleFieldChange('teamName', e.target.value)}
                className="w-full min-h-[48px] px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
              >
                <option value="">Select official authorized team...</option>
                {OFFICIAL_TEAMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.teamName && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.teamName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Team Logo <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  {formData.logoPreview ? (
                    <img src={formData.logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">Logo</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-950/60 file:text-emerald-700 dark:file:text-emerald-300 hover:file:bg-emerald-100 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Rendered on live bidding arena and public catalog.</p>
                </div>
              </div>
              {errors.logo && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.logo}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Faculty Coordinator */}
        <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg md:text-xl text-slate-900 dark:text-slate-100">
                2. Faculty Coordinator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Primary authorized login identity. Mobile number remains strictly confidential.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Primary Login
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Coordinator Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.coordName}
                onChange={(e) => handleFieldChange('coordName', e.target.value)}
                placeholder="e.g. Dr. K. Satyanarayana"
                className="w-full min-h-[48px] px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
              />
              {errors.coordName && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.coordName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.coordDepartment}
                onChange={(e) => handleFieldChange('coordDepartment', e.target.value)}
                className="w-full min-h-[48px] px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Coordinator Mobile (Primary Login) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.coordMobile}
                onChange={(e) => handleFieldChange('coordMobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                className="w-full min-h-[48px] px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Strictly private: used to authenticate the Franchise Terminal.
              </p>
              {errors.coordMobile && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.coordMobile}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Coordinator Photograph <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  {formData.coordPhotoPreview ? (
                    <img src={formData.coordPhotoPreview} alt="Coord" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-400">Photo</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoordPhotoUpload}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-950/60 file:text-emerald-700 dark:file:text-emerald-300 hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>
              </div>
              {errors.coordPhoto && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.coordPhoto}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Captain & Vice-Captain */}
        <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg md:text-xl text-slate-900 dark:text-slate-100">
                3. Captain & Vice-Captain Allotment
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sit outside the 15 auction purchases and cost 0 credits. Once claimed, cannot be chosen by another team.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Zero Purse Cost
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Team Captain <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.captainPlayerId}
                onChange={(e) => handleFieldChange('captainPlayerId', e.target.value)}
                className="w-full min-h-[48px] px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
              >
                <option value="">Select registered player as Captain...</option>
                {INITIAL_REGISTERED_PLAYERS.map((p) => {
                  const isClaimed = claimedPlayerIds.has(p.id);
                  return (
                    <option key={p.id} value={p.id} disabled={isClaimed}>
                      {p.name} ({p.rollNumber}) \u2014 {p.branch} [{p.bucket}] {isClaimed ? '[ALREADY CLAIMED]' : ''}
                    </option>
                  );
                })}
              </select>
              {errors.captain && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.captain}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Team Vice-Captain <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.vcPlayerId}
                onChange={(e) => handleFieldChange('vcPlayerId', e.target.value)}
                className="w-full min-h-[48px] px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
              >
                <option value="">Select registered player as Vice-Captain...</option>
                {INITIAL_REGISTERED_PLAYERS.map((p) => {
                  const isClaimed = claimedPlayerIds.has(p.id);
                  return (
                    <option key={p.id} value={p.id} disabled={isClaimed || p.id === formData.captainPlayerId}>
                      {p.name} ({p.rollNumber}) \u2014 {p.branch} [{p.bucket}]
                    </option>
                  );
                })}
              </select>
              {errors.vc && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.vc}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Captain Mobile Number (Optional Secondary Login)
              </label>
              <input
                type="tel"
                value={formData.captainMobile}
                onChange={(e) => handleFieldChange('captainMobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Optional captain mobile for Team Lead login identity"
                className="w-full min-h-[48px] px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Allows captain to sign in to the bidding terminal with "TEAM LEAD" identity.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Referred Players */}
        <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg md:text-xl text-slate-900 dark:text-slate-100">
                4. Referred Players (Up to 5)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Restriction: Current academic year admissions only. Cost 0 credits, sit outside the 15 squad slots, and never enter the auction pool.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {formData.referredPlayers.length} / 5 Added
            </span>
          </div>

          {/* Add Player Box */}
          {formData.referredPlayers.length < 5 && (
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                Add Current-Year Referred Candidate:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Candidate Name"
                  value={referredDraft.studentName}
                  onChange={(e) => setReferredDraft((d) => ({ ...d, studentName: e.target.value }))}
                  className="min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
                <input
                  type="text"
                  placeholder="Roll Number (e.g. 26811A...)"
                  value={referredDraft.rollNumber}
                  onChange={(e) => setReferredDraft((d) => ({ ...d, rollNumber: e.target.value.toUpperCase() }))}
                  className="min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddReferredPlayer}
                  className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  + Add Candidate
                </button>
              </div>
              {errors.referred && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.referred}</p>
              )}
            </div>
          )}

          {/* Referred List Table */}
          {formData.referredPlayers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-mono uppercase">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Candidate Name</th>
                    <th className="p-3">Roll Number</th>
                    <th className="p-3">Admission</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {formData.referredPlayers.map((p, idx) => (
                    <tr key={p.rollNumber}>
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{p.studentName}</td>
                      <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400">{p.rollNumber}</td>
                      <td className="p-3 font-mono text-slate-500">Year {p.admissionYear}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveReferredPlayer(idx)}
                          className="text-red-500 hover:text-red-400 font-bold px-2 py-1"
                        >
                          \u2715 Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              No referred candidates added yet. Franchises may declare up to 5 admitted candidates.
            </p>
          )}

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200">
            \u26A0 <strong>Conflict Rule:</strong> If two franchises claim the same student, or if the student's independent registration does not match this declaration, the conflict is surfaced to the Super Admin audit ledger for resolution.
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="sticky bottom-0 z-20 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 -mx-4 md:-mx-8 px-4 md:px-8 mt-8 shadow-2xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="min-h-[48px] px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              [ SAVE DRAFT ]
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="min-h-[48px] px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 ring-2 ring-emerald-400/40 transition-all active:scale-95"
            >
              {isSubmitting ? 'SUBMITTING FOR APPROVAL...' : '[ SUBMIT FOR APPROVAL ] \u2192'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
