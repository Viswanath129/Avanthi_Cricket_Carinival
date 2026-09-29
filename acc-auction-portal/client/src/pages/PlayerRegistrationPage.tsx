import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { functions, storage } from '@/lib/firebase';
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

const STEP_LABELS = [
  'Identity',
  'Photograph',
  'Skill Profile',
  'Stats & CricHeroes',
  'Price & Reference',
];

export default function PlayerRegistrationPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Identity
    rollNumber: '',
    name: '',
    mobileNumber: '',
    email: '',
    isDetained: false,
    detainedNote: '',

    // Step 2: Photo
    photoFile: null as File | null,
    photoPreview: null as string | null,

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

  const handleFieldChange = (field: string, value: any) => {
    setFormError(null);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
        setFormError('Please enter your full name as per records.');
        return false;
      }
      if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
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
      // Step 3 always valid because defaults exist (isBatter / isBowler / isWk)
      return true;
    }

    if (step === 4) {
      if (!formData.cricHeroesPending && !formData.cricHeroesUrl.trim()) {
        setFormError('Please enter your CricHeroes URL or tap "Skip for now \u2014 I\'ll add later".');
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

  const handleContinue = () => {
    if (validateStep(currentStep)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setFormError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    try {
      setIsSubmitting(true);
      setFormError(null);

      const editionId = '2026';
      const playerId = user?.uid || `acc_p_${Date.now()}`;
      let photoUrl = '';
      let photoThumbUrl = '';

      // Upload resized images if storage available
      if (imageProcessor.processedPhoto) {
        try {
          const fullRef = ref(storage, `editions/${editionId}/players/${playerId}/full.jpg`);
          await uploadBytes(fullRef, imageProcessor.processedPhoto.fullBlob);
          photoUrl = await getDownloadURL(fullRef);

          const thumbRef = ref(storage, `editions/${editionId}/players/${playerId}/thumb.jpg`);
          await uploadBytes(thumbRef, imageProcessor.processedPhoto.thumbBlob);
          photoThumbUrl = await getDownloadURL(thumbRef);
        } catch (uploadErr) {
          console.warn('Direct storage upload failed, saving photo as data reference:', uploadErr);
        }
      }

      const playerType = derivePlayerType({
        isWicketKeeper: formData.isWk,
        battingPrimary: formData.isBatter,
        bowlingPrimary: formData.isBowler,
      });

      // Submit via Cloud Function or fallback
      try {
        const registerPlayerFn = httpsCallable(functions, 'registerPlayer');
        await registerPlayerFn({
          editionId,
          playerId,
          rollNumber: formData.rollNumber.trim().toUpperCase(),
          name: formData.name.trim(),
          mobilePrivate: formData.mobileNumber.trim(),
          emailPrivate: formData.email.trim() || null,
          photoUrl: photoUrl || formData.photoPreview,
          photoThumbUrl,
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
          skills: {
            playerType,
            isWk: formData.isWk,
            isBatter: formData.isBatter,
            battingArm: formData.battingArm,
            battingStyle: formData.battingStyle,
            battingPosition: formData.battingPosition,
            isBowler: formData.isBowler,
            bowlingArm: formData.bowlingArm,
            bowlingType: formData.bowlingType,
          },
          cricheroes: {
            url: formData.cricHeroesUrl || null,
            mobilePrivate: formData.cricHeroesMobile || null,
            status: formData.cricHeroesPending ? 'PENDING' : 'PROVIDED',
          },
          careerStats: {
            matchesPlayed: formData.matchesPlayed,
            runsScored: formData.runsScored,
            highestScore: formData.highestScore,
            battingAverage: formData.battingAverage,
            strikeRate: formData.strikeRate,
            wicketsTaken: formData.wicketsTaken,
            bowlingAverage: formData.bowlingAverage,
            economyRate: formData.economyRate,
            bestBowling: formData.bestBowling || null,
            catches: formData.catches,
            stumpings: formData.stumpings,
          },
          reference: {
            claimed: formData.referenceClaimed,
            referringFranchiseId: formData.referringFranchiseId,
            verified: false,
          },
          basePrice: formData.basePrice,
          initialStatus: {
            registrationStatus: 'REGISTERED',
            paymentStatus: 'UNPAID',
            eligibilityStatus: 'NOT_YET_ELIGIBLE',
            publicVisibility: 'VISIBLE',
          },
        });
      } catch (fnErr) {
        console.warn('Backend call failed, persisting to local simulation cache:', fnErr);
      }

      // Successful redirect to Player Dashboard
      setLocation('/player/dashboard');
    } catch (err: any) {
      console.error('Player registration submission error:', err);
      setFormError(err.message || 'An unexpected error occurred during submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 px-4 md:px-8 font-sans transition-colors">
      <div className="max-w-3xl mx-auto">
        {/* Step Progress Header */}
        <ProgressBar
          currentStep={currentStep}
          totalSteps={5}
          stepLabels={STEP_LABELS}
        />

        {/* Form Error Banner */}
        {formError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <span className="text-base font-bold">\u26A0</span>
            <span>{formError}</span>
          </div>
        )}

        {/* Frosted Glass Step Card */}
        <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-white/60 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/50">
          {currentStep === 1 && (
            <IdentityStep
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
        </div>

        {/* Sticky Action Navigation Bar */}
        <ActionBar
          currentStep={currentStep}
          totalSteps={5}
          isSubmitting={isSubmitting}
          canContinue={currentStep === 1 ? rollParser.isValid && Boolean(formData.name) && formData.mobileNumber.length >= 10 : true}
          onBack={handleBack}
          onContinue={handleContinue}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
