import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'wouter';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useRollParser } from '@/hooks/useRollParser';
import { useImageProcessor } from '@/hooks/useImageProcessor';
import { ProgressBar } from '@/components/registration/ProgressBar';
import { IdentityStep } from '@/components/registration/IdentityStep';
import { PhotoStep } from '@/components/registration/PhotoStep';
import { SkillProfileStep } from '@/components/registration/SkillProfileStep';
import { StatsCricHeroesStep } from '@/components/registration/StatsCricHeroesStep';
import { ReferenceBasePriceStep } from '@/components/registration/ReferenceBasePriceStep';
import { ActionBar } from '@/components/registration/ActionBar';
import { derivePlayerType } from '@shared/engine/playerType';
import { CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, ArrowRight, User } from 'lucide-react';

const STEP_LABELS = [
  'Identity',
  'Photograph',
  'Skill Profile',
  'Stats & CricHeroes',
  'Price & Reference',
  'Google Account',
];

export default function PlayerRegistrationPage() {
  const [, setLocation] = useLocation();
  const { user, unregisteredGoogleUser, switchGoogleAccount, refreshUserDoc } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Identity
    rollNumber: '',
    name: '',
    mobileNumber: '',
    email: unregisteredGoogleUser?.email || user?.email || '',
    isDetained: false,
    detainedNote: '',

    // Step 2: Photo
    photoFile: null as File | null,
    photoPreview: unregisteredGoogleUser?.photoURL || user?.photoURL || null,

    // Step 3: Skills
    isWk: false,
    isBatter: true,
    battingArm: 'RIGHT' as 'RIGHT' | 'LEFT',
    battingStyle: 'ROTATOR',
    battingPosition: 'MIDDLE_ORDER',
    isBowler: false,
    bowlingArm: 'RIGHT' as 'RIGHT' | 'LEFT',
    bowlingType: 'FAST' as 'FAST' | 'SPIN',

    // Step 4: CricHeroes & Stats
    cricHeroesUrl: '',
    cricHeroesMobile: '',
    cricHeroesPending: false,
    matchesPlayed: 0,
    runsScored: 0,
    highestScore: 0,
    battingAverage: 0,
    strikeRate: 0,
    wicketsTaken: 0,
    bowlingAverage: 0,
    economyRate: 0,
    bestBowling: '',
    catches: 0,
    stumpings: 0,

    // Step 5: Reference & Base Price
    referenceClaimed: false,
    referringFranchiseId: null as number | null,
    basePrice: 20,
  });

  const rollParser = useRollParser(formData.rollNumber, 2026);
  const imageProcessor = useImageProcessor();

  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormError(null);
    setFormData((prev) => (prev[field as keyof typeof prev] === value ? prev : { ...prev, [field]: value }));
  }, []);

  const handlePhotoSelected = (file: File) => {
    setFormData((prev) => ({
      ...prev,
      photoFile: file,
      photoPreview: URL.createObjectURL(file),
    }));
  };

  // Step Validation Logic
  const validateStep = (step: number): boolean => {
    setFormError(null);

    if (step === 1) {
      if (!formData.rollNumber.trim()) {
        setFormError('Please enter your official college Roll Number.');
        return false;
      }
      if (!rollParser.isValid) {
        setFormError('Please enter a valid Avanthi Institute roll number format.');
        return false;
      }
      if (!formData.name.trim()) {
        setFormError('Please enter your full name as per college records.');
        return false;
      }
      const cleanDigits = formData.mobileNumber.replace(/\D/g, '');
      if (cleanDigits.length < 10) {
        setFormError('Please enter a valid 10-digit mobile number.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!formData.photoFile && !formData.photoPreview) {
        setFormError('Please upload a clear photograph of yourself to proceed.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      return true;
    }

    if (step === 4) {
      if (!formData.cricHeroesPending && !formData.cricHeroesUrl.trim()) {
        setFormError('Please enter your CricHeroes URL or check "Skip for now".');
        return false;
      }
      return true;
    }

    if (step === 5) {
      if (!formData.basePrice) {
        setFormError('Please select a starting base price from the official ladder.');
        return false;
      }
      if (rollParser.classification?.referenceEligible && formData.referenceClaimed && !formData.referringFranchiseId) {
        setFormError('Please select which franchise referred you to Avanthi.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleContinue = async () => {
    if (currentStep === 1) {
      // Real uniqueness check for Roll Number & Mobile before continuing
      const normalizedRoll = formData.rollNumber.trim().toUpperCase();
      try {
        const pSnap = await getDoc(doc(db, 'players', normalizedRoll));
        if (pSnap.exists()) {
          setFormError(`ROLL NUMBER ALREADY REGISTERED. A player with roll ${normalizedRoll} already exists in the ACC registry.`);
          return;
        }

        const cleanMobile = formData.mobileNumber.trim().replace(/\D/g, '');
        const mobQuery = query(collection(db, 'players'), where('mobilePrivate', '==', cleanMobile), limit(1));
        const mobSnap = await getDocs(mobQuery);
        if (!mobSnap.empty) {
          setFormError(`MOBILE NUMBER ALREADY REGISTERED. A player with mobile number ${formData.mobileNumber} already exists in the ACC registry.`);
          return;
        }
      } catch (err) {
        // Fallback gracefully on network / rules
      }
    }

    if (validateStep(currentStep)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setFormError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submission & Google Account Linking (Points 4, 5, 6, 7, 39)
  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!validateStep(5)) return;

    try {
      setIsSubmitting(true);
      setFormError(null);

      const editionId = 'acc-2026';
      const normalizedRoll = formData.rollNumber.trim().toUpperCase();
      const cleanMobile = formData.mobileNumber.trim().replace(/\D/g, '');

      // 1. Roll Uniqueness & Mobile Uniqueness Check (Point 5)
      const pDocRef = doc(db, 'players', normalizedRoll);
      const existingRollSnap = await getDoc(pDocRef);
      if (existingRollSnap.exists()) {
        const existingData = existingRollSnap.data();
        if (existingData.uid && existingData.uid !== user?.uid) {
          throw new Error(`ROLL NUMBER ALREADY REGISTERED. Roll ${normalizedRoll} is already registered. Another user cannot claim this player record.`);
        }
      }

      const mobQuery = query(collection(db, 'players'), where('mobilePrivate', '==', cleanMobile), limit(1));
      const existingMobSnap = await getDocs(mobQuery);
      if (!existingMobSnap.empty) {
        const match = existingMobSnap.docs[0];
        if (match.id !== normalizedRoll) {
          throw new Error(`MOBILE NUMBER ALREADY REGISTERED. A player with mobile number ${formData.mobileNumber} is already registered.`);
        }
      }

      // 2. Resolve Google Account Authentication (Point 4 & 6)
      let activeGoogleUser = user;
      if (!activeGoogleUser) {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const authResult = await signInWithPopup(auth, provider);
        activeGoogleUser = authResult.user;
      }

      // 3. Check Google Account Conflict (Point 6 & 47)
      const userDocRef = doc(db, 'users', activeGoogleUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const uData = userSnap.data();
        if (uData.playerId && uData.playerId !== normalizedRoll) {
          throw new Error(`ACCOUNT ALREADY LINKED. This Google account is already linked to player ID "${uData.playerId}". One Google account may only be linked to one canonical player.`);
        }
      }

      // 4. Upload photo if present
      let photoUrl = formData.photoPreview || '';
      if (imageProcessor.processedPhoto) {
        try {
          const photoRef = ref(storage, `editions/${editionId}/players/${normalizedRoll}/full.jpg`);
          await uploadBytes(photoRef, imageProcessor.processedPhoto.fullBlob);
          photoUrl = await getDownloadURL(photoRef);
        } catch (uploadErr) {
          console.warn('Storage upload fallback:', uploadErr);
        }
      }

      const playerType = derivePlayerType({
        isWicketKeeper: formData.isWk,
        battingPrimary: formData.isBatter,
        bowlingPrimary: formData.isBowler,
      });

      // 5. Store /players/{normalizedRoll} (Point 4, 5, 31)
      const playerData = {
        playerId: normalizedRoll,
        editionId,
        uid: activeGoogleUser.uid,
        authUid: activeGoogleUser.uid,
        rollNumber: normalizedRoll,
        rollNumberNormalized: normalizedRoll,
        name: formData.name.trim(),
        mobilePrivate: cleanMobile,
        emailPrivate: activeGoogleUser.email || formData.email.trim() || null,
        photoUrl: photoUrl || activeGoogleUser.photoURL || null,
        academic: {
          program: rollParser.classification?.program || 'BTECH',
          branch: rollParser.classification?.branch || 'Unknown',
          branchCode: rollParser.classification?.branchCode || '00',
          admissionYear: rollParser.classification?.admissionYear || 2026,
          studyYear: rollParser.classification?.studyYear || 1,
          bucket: rollParser.classification?.bucket || 'B1',
          entryType: rollParser.classification?.entryType || 'REGULAR',
          isDetainedFlag: formData.isDetained,
          detainedNote: formData.detainedNote || null,
        },
        cricket: {
          battingStyle: formData.battingStyle,
          battingArm: formData.battingArm,
          battingPosition: formData.battingPosition,
          bowlingStyle: formData.bowlingArm,
          bowlingType: formData.bowlingType,
          preferredPosition: formData.battingPosition,
          isWicketKeeper: formData.isWk,
        },
        derived: {
          playerType,
        },
        cricheroes: {
          profileUrl: formData.cricHeroesUrl.trim() || null,
          registeredMobilePrivate: formData.cricHeroesMobile.trim() || null,
          status: formData.cricHeroesPending ? 'PROFILE_CREATION_PENDING' : 'VERIFIED',
        },
        stats: {
          matches: formData.matchesPlayed,
          runs: formData.runsScored,
          wickets: formData.wicketsTaken,
          strikeRate: formData.strikeRate,
          battingAverage: formData.battingAverage,
          bowlingAverage: formData.bowlingAverage,
          catches: formData.catches,
          stumpings: formData.stumpings,
        },
        reference: {
          eligible: Boolean(rollParser.classification?.referenceEligible),
          franchiseId: formData.referenceClaimed ? String(formData.referringFranchiseId) : null,
          playerDeclaration: formData.referenceClaimed,
          franchiseDeclaration: false,
          adminVerified: false,
        },
        registration: {
          status: 'SUBMITTED',
          paid: false,
          editingBlocked: false,
        },
        accountStatus: 'PENDING',
        approvalStatus: 'PENDING_APPROVAL',
        auctionable: false,
        basePrice: formData.basePrice,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(pDocRef, playerData, { merge: true });

      // 6. Store /users/{uid} (Point 4, 31)
      const userRecordData = {
        uid: activeGoogleUser.uid,
        role: 'PLAYER',
        playerId: normalizedRoll,
        email: activeGoogleUser.email,
        displayName: activeGoogleUser.displayName || formData.name.trim(),
        photoURL: photoUrl || activeGoogleUser.photoURL || null,
        mobile: cleanMobile,
        accountStatus: 'PENDING',
        approvalStatus: 'PENDING_APPROVAL',
        authProvider: 'google.com',
        status: 'ACTIVE',
        franchiseId: null,
        identityType: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userDocRef, userRecordData, { merge: true });

      // Public projection
      try {
        await setDoc(doc(db, 'playersPublic', normalizedRoll), {
          playerId: normalizedRoll,
          editionId,
          name: formData.name.trim(),
          photoUrl: photoUrl || activeGoogleUser.photoURL || null,
          academic: {
            program: rollParser.classification?.program || 'BTECH',
            branch: rollParser.classification?.branch || 'Unknown',
            studyYear: rollParser.classification?.studyYear || 1,
            bucket: rollParser.classification?.bucket || 'B1',
          },
          derived: { playerType },
          stats: playerData.stats,
          basePrice: formData.basePrice,
          auctionable: false,
          registration: { status: 'SUBMITTED', paid: false },
        }, { merge: true });
      } catch (pubErr) {
        // Safe if security rule permits cloud functions only
      }

      await refreshUserDoc();

      // Show Successful Registration & Linking Confirmation (Point 39)
      setRegistrationComplete({
        rollNumber: normalizedRoll,
        name: formData.name.trim(),
        googleEmail: activeGoogleUser.email,
        status: 'PENDING ADMIN APPROVAL',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Registration submission error:', err);
      setFormError(err.message || 'Registration failed. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN (Point 39)
  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 md:p-6 font-sans">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-2 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="font-serif font-bold text-3xl text-white">GOOGLE ACCOUNT LINKED</h1>
            <p className="text-xs uppercase tracking-widest font-mono text-emerald-400 font-semibold">
              ACC 2026 \u00B7 Registration Recorded
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Player Identity (Roll Number):</span>
                <span className="font-mono font-bold text-base text-emerald-400">{registrationComplete.rollNumber}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Candidate Name:</span>
                <span className="font-semibold text-white">{registrationComplete.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Linked Google Identity:</span>
                <span className="font-mono text-slate-200">{registrationComplete.googleEmail}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>ACC Status:</span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {registrationComplete.status}
                </span>
              </div>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-2xl p-4 text-xs text-emerald-200/90 leading-relaxed">
              <p className="font-semibold text-white mb-1">What happens next?</p>
              Your player dossier has been submitted to the Tournament Directorate. Upon verification of your roll number, academic year, and CricHeroes profile, your profile will be approved for auction eligibility. You can sign in anytime using your linked Google account to track verification progress.
            </div>

            <div className="space-y-3 pt-2">
              <Link href="/login">
                <button className="w-full min-h-[48px] px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                  <span>Go to Sign In & Track Status</span>
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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Step Progress Header */}
        <ProgressBar
          currentStep={currentStep}
          totalSteps={6}
          stepLabels={STEP_LABELS}
        />

        {/* Form Error Banner */}
        {formError && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200 shadow-lg">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        {/* Frosted Glass Step Card */}
        <div className="backdrop-blur-2xl bg-slate-800/85 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl">
          {currentStep === 1 && (
            <IdentityStep
              key="step-identity"
              rollNumber={formData.rollNumber}
              name={formData.name}
              mobileNumber={formData.mobileNumber}
              email={formData.email}
              isDetained={formData.isDetained}
              detainedNote={formData.detainedNote}
              rollParser={rollParser}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 2 && (
            <PhotoStep
              imageProcessor={imageProcessor}
              onPhotoSelected={handlePhotoSelected}
              photoPreview={formData.photoPreview}
            />
          )}

          {currentStep === 3 && (
            <SkillProfileStep
              isWk={formData.isWk}
              isBatter={formData.isBatter}
              battingArm={formData.battingArm}
              battingStyle={formData.battingStyle}
              battingPosition={formData.battingPosition}
              isBowler={formData.isBowler}
              bowlingArm={formData.bowlingArm}
              bowlingType={formData.bowlingType}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 4 && (
            <StatsCricHeroesStep
              cricHeroesUrl={formData.cricHeroesUrl}
              cricHeroesMobile={formData.cricHeroesMobile}
              cricHeroesPending={formData.cricHeroesPending}
              matchesPlayed={formData.matchesPlayed}
              runsScored={formData.runsScored}
              highestScore={formData.highestScore}
              battingAverage={formData.battingAverage}
              strikeRate={formData.strikeRate}
              wicketsTaken={formData.wicketsTaken}
              bowlingAverage={formData.bowlingAverage}
              economyRate={formData.economyRate}
              bestBowling={formData.bestBowling}
              catches={formData.catches}
              stumpings={formData.stumpings}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 5 && (
            <ReferenceBasePriceStep
              isReferenceEligible={Boolean(rollParser.classification?.referenceEligible)}
              referenceClaimed={formData.referenceClaimed}
              referringFranchiseId={formData.referringFranchiseId}
              basePrice={formData.basePrice}
              onChange={handleFieldChange}
            />
          )}

          {/* STEP 6: GOOGLE ACCOUNT LINKING REVIEW */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-700/80 pb-4">
                <h2 className="font-serif font-bold text-xl text-white">
                  6. Link Authorized Google Account
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Connect your real identity. The authenticated Google UID will be bound permanently to roll number <span className="font-mono font-bold text-emerald-400">{formData.rollNumber.trim().toUpperCase()}</span>.
                </p>
              </div>

              {/* Dossier Summary Preview */}
              <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Player Name:</span>
                  <span className="font-bold text-white">{formData.name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Roll Number:</span>
                  <span className="font-mono font-bold text-emerald-400">{formData.rollNumber.trim().toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Academic Bucket:</span>
                  <span className="font-mono font-semibold text-slate-300">
                    {rollParser.classification?.bucket || 'B1'} ({rollParser.classification?.branch || 'General'})
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Base Price:</span>
                  <span className="font-mono font-bold text-amber-400">₹{formData.basePrice}L</span>
                </div>
              </div>

              {/* Connected Google Identity State */}
              {user ? (
                <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{user.displayName || formData.name}</p>
                      <p className="text-[11px] font-mono text-emerald-300 truncate">{user.email}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Authenticated
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    This Google account will be linked to your ACC player record. You will use it for all future logins.
                  </p>

                  <button
                    type="button"
                    onClick={() => switchGoogleAccount('PLAYER')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium"
                  >
                    Switch to a different Google account
                  </button>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-white">Google Verification Required</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Click the button below to authenticate with Google. This securely locks your registration to your Google credentials.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Action Navigation Bar */}
        <ActionBar
          currentStep={currentStep}
          totalSteps={6}
          isSubmitting={isSubmitting}
          canContinue={currentStep === 1 ? rollParser.isValid && Boolean(formData.name) && formData.mobileNumber.length >= 10 : true}
          onBack={handleBack}
          onContinue={currentStep === 6 ? handleSubmit : handleContinue}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
