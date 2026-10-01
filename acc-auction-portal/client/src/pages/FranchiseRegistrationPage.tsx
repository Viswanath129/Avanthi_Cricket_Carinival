import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  User, 
  Upload, 
  Plus, 
  Trash2, 
  Clock 
} from 'lucide-react';

const OFFICIAL_TEAMS = [
  { name: 'CSE Champions', code: 'CSE', number: 1 },
  { name: 'ECE Electro Kings', code: 'ECE', number: 2 },
  { name: 'Mechanical Warriors', code: 'ME', number: 3 },
  { name: 'Civil Gladiators', code: 'CE', number: 4 },
  { name: 'EEE Spark Royals', code: 'EEE', number: 5 },
  { name: 'CSM Cyber Knights', code: 'CSM', number: 6 },
  { name: 'CSD Data Strikers', code: 'CSD', number: 7 },
  { name: 'Diploma Dynamic Titans', code: 'DIP', number: 8 },
  { name: 'Pharmacy Phoenix', code: 'PHARM', number: 9 },
  { name: 'MBA Mavericks', code: 'MBA', number: 10 },
  { name: 'Staff Super Kings', code: 'STAFF', number: 11 },
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

const INITIAL_REGISTERED_PLAYERS = [
  { id: '25811A0403', name: 'Sai Teja', rollNumber: '25811A0403', branch: 'ECE', studyYear: 2, bucket: 'B2' },
  { id: '24811A0501', name: 'Harsha Vardhan', rollNumber: '24811A0501', branch: 'CSE', studyYear: 3, bucket: 'B3' },
  { id: '25815A0403', name: 'Dinesh Kumar', rollNumber: '25815A0403', branch: 'ECE', studyYear: 3, bucket: 'B3' },
  { id: '23811A4201', name: 'Naveen Reddy', rollNumber: '23811A4201', branch: 'CSM', studyYear: 4, bucket: 'B4' },
  { id: '24597-CM-015', name: 'Murali Krishna', rollNumber: '24597-CM-015', branch: 'Diploma CM', studyYear: 2, bucket: 'D5' },
  { id: '26811A0501', name: 'Rohit Nambiar', rollNumber: '26811A0501', branch: 'CSE', studyYear: 1, bucket: 'B1' },
  { id: '26811A0402', name: 'V. Kalyan', rollNumber: '26811A0402', branch: 'ECE', studyYear: 1, bucket: 'B1' },
  { id: '26815A0301', name: 'P. Shiva', rollNumber: '26815A0301', branch: 'ME', studyYear: 2, bucket: 'B2' },
  { id: '26597-EC-022', name: 'Ravi Teja', rollNumber: '26597-EC-022', branch: 'Diploma EC', studyYear: 1, bucket: 'D5' },
  { id: '26597-M-041', name: 'Kiran Kumar', rollNumber: '26597-M-041', branch: 'Diploma M', studyYear: 1, bucket: 'D5' },
];

const STEPS = [
  'Team Info',
  'Coordinator',
  'Leadership',
  'Referred',
  'Google Account',
  'Review & Submit',
];

export default function FranchiseRegistrationPage() {
  const [, setLocation] = useLocation();
  const { user, switchGoogleAccount, refreshUserDoc } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Team Info
    teamName: '',
    shortCode: '',
    teamNumber: 1,
    logoFile: null as File | null,
    logoPreview: null as string | null,

    // Step 2: Coordinator
    coordName: '',
    coordDepartment: DEPARTMENTS[0],
    coordMobile: '',
    coordEmail: '',
    coordPhotoFile: null as File | null,
    coordPhotoPreview: null as string | null,

    // Step 3: Captain & VC
    captainPlayerId: '',
    vcPlayerId: '',
    captainMobile: '',

    // Step 4: Referred Players
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
  const [registrationSuccess, setRegistrationSuccess] = useState<any | null>(null);

  // Available registered players in system
  const [registeredPlayers, setRegisteredPlayers] = useState(INITIAL_REGISTERED_PLAYERS);

  // Load live registered players from Firestore if available
  useEffect(() => {
    async function loadPlayers() {
      try {
        const snap = await getDocs(collection(db, 'players'));
        if (!snap.empty) {
          const list = snap.docs.map(d => ({
            id: d.id,
            name: d.data().name || d.id,
            rollNumber: d.data().rollNumber || d.id,
            branch: d.data().academic?.branch || 'General',
            studyYear: d.data().academic?.studyYear || 1,
            bucket: d.data().academic?.bucket || 'B1',
          }));
          setRegisteredPlayers(list);
        }
      } catch {
        // use fallback
      }
    }
    loadPlayers();
  }, []);

  const handleFieldChange = (field: string, val: any) => {
    setErrors(prev => ({ ...prev, [field]: '', global: '' }));
    if (field === 'teamName') {
      const match = OFFICIAL_TEAMS.find(t => t.name === val);
      setFormData(prev => ({
        ...prev,
        teamName: val,
        shortCode: match ? match.code : val.substring(0, 3).toUpperCase(),
        teamNumber: match ? match.number : prev.teamNumber,
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: val }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData(prev => ({
      ...prev,
      logoFile: file,
      logoPreview: URL.createObjectURL(file),
    }));
  };

  const handleCoordPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData(prev => ({
      ...prev,
      coordPhotoFile: file,
      coordPhotoPreview: URL.createObjectURL(file),
    }));
  };

  const addReferredPlayer = () => {
    if (!referredDraft.studentName.trim() || !referredDraft.rollNumber.trim()) {
      setErrors(prev => ({ ...prev, referred: 'Please enter both student name and roll number.' }));
      return;
    }
    if (formData.referredPlayers.length >= 5) {
      setErrors(prev => ({ ...prev, referred: 'Maximum 5 referred players permitted per franchise.' }));
      return;
    }
    setFormData(prev => ({
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
    setErrors(prev => ({ ...prev, referred: '' }));
  };

  const removeReferredPlayer = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      referredPlayers: prev.referredPlayers.filter((_, i) => i !== idx),
    }));
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!formData.teamName) errs.teamName = 'Please select or enter the official franchise team name.';
    }

    if (step === 2) {
      if (!formData.coordName.trim()) errs.coordName = 'Faculty coordinator name is required.';
      const cleanMob = formData.coordMobile.replace(/\D/g, '');
      if (cleanMob.length < 10) errs.coordMobile = 'A valid 10-digit mobile number is required.';
    }

    if (step === 3) {
      if (!formData.captainPlayerId) errs.captain = 'Captain selection is required.';
      if (!formData.vcPlayerId) errs.vc = 'Vice-Captain selection is required.';
      if (formData.captainPlayerId && formData.vcPlayerId && formData.captainPlayerId === formData.vcPlayerId) {
        errs.vc = 'Captain and Vice-Captain cannot be the same player.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Check duplicate franchise name in Firestore
      try {
        const fQuery = query(collection(db, 'franchises'), where('name', '==', formData.teamName.trim()), limit(1));
        const fSnap = await getDocs(fQuery);
        if (!fSnap.empty) {
          setErrors({ teamName: `DUPLICATE FRANCHISE: "${formData.teamName}" is already registered. Another franchise cannot claim this name.` });
          return;
        }
      } catch {
        // fallback
      }
    }

    if (validateStep(currentStep)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit Franchise Registration (Points 9, 10, 11, 40)
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      const editionId = 'acc-2026';
      const franchiseId = `FR${String(formData.teamNumber).padStart(3, '0')}`;

      // 1. Resolve Coordinator Google Identity
      let coordGoogleUser = user;
      if (!coordGoogleUser) {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        coordGoogleUser = result.user;
      }

      // 2. Check if this Google account is already linked to another role or franchise (Point 47)
      const uSnap = await getDoc(doc(db, 'users', coordGoogleUser.uid));
      if (uSnap.exists()) {
        const uData = uSnap.data();
        if (uData.role === 'PLAYER') {
          throw new Error('ACCOUNT CONFLICT: This Google account is already registered as an ACC Player. Faculty Coordinator must use their faculty Google account.');
        }
        if (uData.franchiseId && uData.franchiseId !== franchiseId) {
          throw new Error(`ACCOUNT ALREADY LINKED: This Google account is already linked to ${uData.franchiseId}. One Google account cannot own multiple franchises.`);
        }
      }

      // 3. Upload files if present
      let logoUrl = formData.logoPreview || '';
      let coordPhotoUrl = formData.coordPhotoPreview || '';

      if (formData.logoFile) {
        try {
          const lRef = ref(storage, `editions/${editionId}/franchises/${franchiseId}/logo.png`);
          await uploadBytes(lRef, formData.logoFile);
          logoUrl = await getDownloadURL(lRef);
        } catch {
          // fallback
        }
      }

      if (formData.coordPhotoFile) {
        try {
          const pRef = ref(storage, `editions/${editionId}/franchises/${franchiseId}/coord.jpg`);
          await uploadBytes(pRef, formData.coordPhotoFile);
          coordPhotoUrl = await getDownloadURL(pRef);
        } catch {
          // fallback
        }
      }

      // 4. Save Franchise Document (/franchises/{franchiseId}) (Point 10, 30)
      const franchiseData = {
        franchiseId,
        editionId,
        name: formData.teamName,
        shortName: formData.shortCode || formData.teamName.substring(0, 3).toUpperCase(),
        logoUrl: logoUrl || null,
        coordinator: {
          name: formData.coordName.trim(),
          department: formData.coordDepartment,
          mobilePrivate: formData.coordMobile.trim(),
          emailPrivate: coordGoogleUser.email || formData.coordEmail.trim() || '',
          photoUrl: coordPhotoUrl || coordGoogleUser.photoURL || null,
        },
        captainPlayerId: formData.captainPlayerId || null,
        viceCaptainPlayerId: formData.vcPlayerId || null,
        captainMobilePrivate: formData.captainMobile.trim() || null,
        primaryAuthUid: coordGoogleUser.uid,
        secondaryAuthUid: null, // Team leader added later
        purseInitial: 1000,
        purseRemaining: 1000,
        status: 'PENDING',
        approvalStatus: 'PENDING_APPROVAL',
        accountStatus: 'PENDING',
        squad: {
          count: 0,
          bucketCounts: { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0, M6: 0 },
          auctionPurchases: 0,
          referredCount: formData.referredPlayers.length,
        },
        referredPlayers: formData.referredPlayers,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'franchises', franchiseId), franchiseData, { merge: true });

      // 5. Save Primary User Record (/users/{uid}) (Point 10, 30)
      const userRecordData = {
        uid: coordGoogleUser.uid,
        role: 'FRANCHISE_COORDINATOR',
        franchiseId,
        identityType: 'COORDINATOR',
        email: coordGoogleUser.email,
        displayName: coordGoogleUser.displayName || formData.coordName.trim(),
        photoURL: coordPhotoUrl || coordGoogleUser.photoURL || null,
        mobile: formData.coordMobile.trim(),
        accountStatus: 'PENDING',
        approvalStatus: 'PENDING_APPROVAL',
        authProvider: 'google.com',
        status: 'ACTIVE',
        playerId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', coordGoogleUser.uid), userRecordData, { merge: true });

      // 6. Save franchise user mapping
      await setDoc(doc(db, 'franchiseUsers', coordGoogleUser.uid), {
        uid: coordGoogleUser.uid,
        franchiseId,
        identityType: 'COORDINATOR',
        email: coordGoogleUser.email || '',
        mobile: formData.coordMobile.trim(),
        status: 'ACTIVE',
        createdAt: serverTimestamp(),
      }, { merge: true });

      await refreshUserDoc();

      setRegistrationSuccess({
        teamName: formData.teamName,
        franchiseId,
        coordinatorName: formData.coordName,
        googleEmail: coordGoogleUser.email,
        status: 'PENDING ADMIN APPROVAL',
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Franchise registration error:', err);
      setErrors({ global: err.message || 'Registration submission failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS BANNER (Point 40)
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 md:p-6 font-sans">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-500/20 border border-blue-500/40 text-blue-400 mb-2 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="font-serif font-bold text-3xl text-white">FRANCHISE REGISTRATION RECORDED</h1>
            <p className="text-xs uppercase tracking-widest font-mono text-blue-400 font-semibold">
              ACC 2026 \u00B7 Departmental Submission
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Franchise Team:</span>
                <span className="font-bold text-base text-white">{registrationSuccess.teamName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Assigned Franchise ID:</span>
                <span className="font-mono font-bold text-blue-400">{registrationSuccess.franchiseId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Faculty Coordinator:</span>
                <span className="font-semibold text-slate-200">{registrationSuccess.coordinatorName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Linked Google Identity:</span>
                <span className="font-mono text-slate-300">{registrationSuccess.googleEmail}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Status:</span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {registrationSuccess.status}
                </span>
              </div>
            </div>

            <div className="bg-blue-950/30 border border-blue-800/40 rounded-2xl p-4 text-xs text-blue-200/90 leading-relaxed">
              <p className="font-semibold text-white mb-1">Approval Protocol</p>
              Super Admin and the Tournament Directorate will review your faculty coordinator authorization, departmental allocation, and captain nominations. Upon activation, your 1000-credit auction purse and live bidding paddle will be unlocked.
            </div>

            <div className="space-y-3 pt-2">
              <Link href="/login">
                <button className="w-full min-h-[48px] px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                  <span>Go to Franchise Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/">
                <button className="w-full min-h-[44px] px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl border border-slate-600/60 transition-all">
                  Return to Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 md:px-8 font-sans transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-serif font-bold text-blue-400 text-xl shadow-sm">
              ACC
            </div>
            <div>
              <h1 className="font-serif font-bold text-2xl md:text-3xl text-white tracking-tight">
                Franchise Team Registration
              </h1>
              <p className="text-xs uppercase tracking-widest font-mono text-blue-400 font-semibold mt-0.5">
                ACC 2026 \u00B7 Authorized Departmental Entry
              </p>
            </div>
          </div>
          <Link href="/login">
            <button className="min-h-[40px] px-4 py-2 text-xs font-semibold rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition-all">
              \u2190 Back to Sign In
            </button>
          </Link>
        </div>

        {/* Global Error Banner */}
        {errors.global && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errors.global}</span>
          </div>
        )}

        {/* Progress Tabs */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {STEPS.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            return (
              <div
                key={label}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isActive
                    ? 'bg-blue-600/20 border-blue-500/50 text-white font-bold'
                    : isCompleted
                    ? 'bg-slate-800/80 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}
              >
                <div className="text-[10px] font-mono uppercase tracking-wider">
                  Step {stepNum}
                </div>
                <div className="text-xs truncate font-medium mt-0.5">{label}</div>
              </div>
            );
          })}
        </div>

        {/* STEP 1: TEAM INFORMATION */}
        {currentStep === 1 && (
          <div className="bg-slate-800/85 border border-slate-700/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-slate-700/80 pb-3">
              <h2 className="font-serif font-bold text-xl text-white">1. Team Information</h2>
              <p className="text-xs text-slate-400 mt-1">Official authorized franchise identity and team emblem.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Authorized Team Name <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.teamName}
                  onChange={(e) => handleFieldChange('teamName', e.target.value)}
                  className="w-full min-h-[48px] px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Select official authorized team...</option>
                  {OFFICIAL_TEAMS.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name} ({t.code}) \u2014 Team #{t.number}
                    </option>
                  ))}
                </select>
                {errors.teamName && (
                  <p className="mt-1 text-xs text-rose-400 font-medium">{errors.teamName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Franchise Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900 flex items-center justify-center overflow-hidden">
                    {formData.logoPreview ? (
                      <img src={formData.logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">Logo</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-950/60 file:text-blue-300 hover:file:bg-blue-900 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, or SVG emblem.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: FACULTY COORDINATOR */}
        {currentStep === 2 && (
          <div className="bg-slate-800/85 border border-slate-700/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-slate-700/80 pb-3">
              <h2 className="font-serif font-bold text-xl text-white">2. Faculty Coordinator</h2>
              <p className="text-xs text-slate-400 mt-1">Primary authorized login identity. Mobile number remains strictly confidential.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Coordinator Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.coordName}
                  onChange={(e) => handleFieldChange('coordName', e.target.value)}
                  placeholder="e.g. Dr. S. Narayana"
                  className="w-full min-h-[48px] px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.coordName && <p className="mt-1 text-xs text-rose-400">{errors.coordName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Department <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.coordDepartment}
                  onChange={(e) => handleFieldChange('coordDepartment', e.target.value)}
                  className="w-full min-h-[48px] px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Coordinator Mobile (Confidential) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.coordMobile}
                  onChange={(e) => handleFieldChange('coordMobile', e.target.value)}
                  placeholder="e.g. 9848012345"
                  className="w-full min-h-[48px] px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.coordMobile && <p className="mt-1 text-xs text-rose-400">{errors.coordMobile}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Coordinator Photograph
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900 flex items-center justify-center overflow-hidden">
                    {formData.coordPhotoPreview ? (
                      <img src={formData.coordPhotoPreview} alt="Coord" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoordPhotoUpload}
                      className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-950/60 file:text-blue-300 hover:file:bg-blue-900 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CAPTAIN & VICE-CAPTAIN */}
        {currentStep === 3 && (
          <div className="bg-slate-800/85 border border-slate-700/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-slate-700/80 pb-3">
              <h2 className="font-serif font-bold text-xl text-white">3. Team Leadership</h2>
              <p className="text-xs text-slate-400 mt-1">Select verified players to represent captaincy.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Franchise Captain <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.captainPlayerId}
                  onChange={(e) => handleFieldChange('captainPlayerId', e.target.value)}
                  className="w-full min-h-[48px] px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select registered player as Captain...</option>
                  {registeredPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.rollNumber}) \u2014 {p.bucket}
                    </option>
                  ))}
                </select>
                {errors.captain && <p className="mt-1 text-xs text-rose-400">{errors.captain}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Vice-Captain <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.vcPlayerId}
                  onChange={(e) => handleFieldChange('vcPlayerId', e.target.value)}
                  className="w-full min-h-[48px] px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select registered player as Vice-Captain...</option>
                  {registeredPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.rollNumber}) \u2014 {p.bucket}
                    </option>
                  ))}
                </select>
                {errors.vc && <p className="mt-1 text-xs text-rose-400">{errors.vc}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Captain Mobile (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.captainMobile}
                  onChange={(e) => handleFieldChange('captainMobile', e.target.value)}
                  placeholder="e.g. 9848098765"
                  className="w-full min-h-[48px] px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: REFERRED PLAYERS */}
        {currentStep === 4 && (
          <div className="bg-slate-800/85 border border-slate-700/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-slate-700/80 pb-3 flex justify-between items-center">
              <div>
                <h2 className="font-serif font-bold text-xl text-white">4. Referred Players</h2>
                <p className="text-xs text-slate-400 mt-1">Declare up to 5 students referred by this department (subject to admin quota verification).</p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {formData.referredPlayers.length} / 5 Added
              </span>
            </div>

            {errors.referred && (
              <p className="text-xs text-rose-400 font-semibold">{errors.referred}</p>
            )}

            {/* List of declared referred players */}
            {formData.referredPlayers.length > 0 && (
              <div className="space-y-2">
                {formData.referredPlayers.map((refItem, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-xs">
                    <div>
                      <span className="font-bold text-white">{refItem.studentName}</span>
                      <span className="font-mono text-blue-400 ml-2">({refItem.rollNumber})</span>
                      <span className="text-slate-400 ml-2">\u00B7 {refItem.admissionYear}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeReferredPlayer(idx)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Referred Player Form */}
            {formData.referredPlayers.length < 5 && (
              <div className="p-4 bg-slate-900/60 border border-slate-700/60 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Add Student Referral</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={referredDraft.studentName}
                    onChange={(e) => setReferredDraft(p => ({ ...p, studentName: e.target.value }))}
                    placeholder="Student Full Name"
                    className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <input
                    type="text"
                    value={referredDraft.rollNumber}
                    onChange={(e) => setReferredDraft(p => ({ ...p, rollNumber: e.target.value }))}
                    placeholder="Roll Number (e.g. 26811A0501)"
                    className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                  <div className="flex gap-2">
                    <select
                      value={referredDraft.admissionYear}
                      onChange={(e) => setReferredDraft(p => ({ ...p, admissionYear: Number(e.target.value) }))}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value={2026}>2026-27 (Current)</option>
                      <option value={2025}>2025-26</option>
                      <option value={2024}>2024-25</option>
                      <option value={2023}>2023-24</option>
                    </select>
                    <button
                      type="button"
                      onClick={addReferredPlayer}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: GOOGLE ACCOUNT LINKING */}
        {currentStep === 5 && (
          <div className="bg-slate-800/85 border border-slate-700/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-slate-700/80 pb-3">
              <h2 className="font-serif font-bold text-xl text-white">5. Coordinator Google Account Link</h2>
              <p className="text-xs text-slate-400 mt-1">
                The faculty coordinator is the PRIMARY franchise login. Link your official Google account.
              </p>
            </div>

            {user ? (
              <div className="bg-blue-950/30 border border-blue-800/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user.displayName || formData.coordName}</p>
                    <p className="text-[11px] font-mono text-blue-300 truncate">{user.email}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Ready to Link
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  This Google account will be designated as the primary faculty coordinator login for {formData.teamName || 'this franchise'}.
                </p>
                <button
                  type="button"
                  onClick={() => switchGoogleAccount('FRANCHISE')}
                  className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                >
                  Use a different Google account
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">Coordinator Google Authentication</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Click Continue to authenticate with your official Google account. It will be bound to this franchise record upon final submission.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: REVIEW & SUBMIT */}
        {currentStep === 6 && (
          <div className="bg-slate-800/85 border border-slate-700/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-slate-700/80 pb-3">
              <h2 className="font-serif font-bold text-xl text-white">6. Review & Submit Franchise Record</h2>
              <p className="text-xs text-slate-400 mt-1">Review full team configuration before formal submission for Super Admin approval.</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Franchise Team:</span>
                <span className="font-bold text-white text-sm">{formData.teamName} ({formData.shortCode})</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Faculty Coordinator:</span>
                <span className="font-semibold text-slate-200">{formData.coordName} ({formData.coordDepartment})</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Coordinator Mobile:</span>
                <span className="font-mono text-slate-300">{formData.coordMobile}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Captain:</span>
                <span className="font-mono font-bold text-blue-400">{formData.captainPlayerId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Vice-Captain:</span>
                <span className="font-mono font-bold text-blue-400">{formData.vcPlayerId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Referred Students:</span>
                <span className="font-semibold text-white">{formData.referredPlayers.length} declared</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Allocated Purse:</span>
                <span className="font-mono font-bold text-emerald-400">1000 Credits (Unlocked on Approval)</span>
              </div>
            </div>

            <div className="p-4 bg-amber-950/30 border border-amber-800/50 rounded-2xl text-xs text-amber-200/90 leading-relaxed">
              <span className="font-bold text-white">Submission Notice: </span>
              Submission places your franchise in <span className="font-mono font-bold text-amber-400">PENDING_APPROVAL</span> status. Once the Super Admin certifies coordinator identity and quotas, your franchise terminal access and auction controls will become active.
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="flex justify-between items-center pt-2">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="min-h-[46px] px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              \u2190 Previous
            </button>
          ) : <div />}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="min-h-[46px] px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-950/40"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-h-[48px] px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-emerald-950/50 disabled:opacity-50 flex items-center gap-2"
            >
              <span>{isSubmitting ? 'Registering Franchise...' : 'Submit & Link Google Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
