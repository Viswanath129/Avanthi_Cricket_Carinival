import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { functions, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { BASE_PRICE_LADDER, BUCKET_LABELS } from '@shared/types';
import { classifyRollNumber } from '@shared/engine/rollClassifier';
import { derivePlayerType } from '@shared/engine/playerType';

export default function PlayerRegistrationPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    mobileNumber: '',
    email: '',
    photo: null as File | null,
    
    isWk: false,
    isBatter: false,
    isBowler: false,
    bowlingStyle: '',
    bowlingArm: '',
    battingStyle: '',
    
    cricHeroesUrl: '',
    cricHeroesMobile: '',
    matchesPlayed: 0,
    runsScored: 0,
    wicketsTaken: 0,
    strikeRate: 0,
    battingAverage: 0,
    bowlingAverage: 0,
    catches: 0,
    stumpings: 0,
    
    basePrice: 0,
    referenceClaimed: false,
  });

  const classification = formData.rollNumber.length >= 6 ? classifyRollNumber(formData.rollNumber) : null;
  const playerType = derivePlayerType({
    keepsWicket: formData.isWk,
    bats: formData.isBatter,
    bowls: formData.isBowler
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else if (type === 'file') {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: name === 'rollNumber' ? value.toUpperCase() : value }));
    }
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!formData.rollNumber || !formData.name || !formData.mobileNumber) {
         setError('Roll number, name, and mobile number are required.');
         return;
      }
    }
    if (step === 2) {
      if (!formData.isWk && !formData.isBatter && !formData.isBowler) {
        setError('Please select at least one cricket skill.');
        return;
      }
    }
    if (step === 4) {
      if (!formData.basePrice) {
        setError('Please select a base price.');
        return;
      }
    }
    window.scrollTo(0, 0);
    setStep(s => Math.min(s + 1, 5));
  };
  
  const handlePrev = () => {
    setError('');
    window.scrollTo(0, 0);
    setStep(s => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      
      let photoUrl = '';
      const editionId = '2025'; // Default or context-based edition
      const playerId = user?.uid || `temp_${Date.now()}`;

      if (formData.photo) {
        const photoRef = ref(storage, `players/${editionId}/${playerId}/photo.jpg`);
        await uploadBytes(photoRef, formData.photo);
        photoUrl = await getDownloadURL(photoRef);
      }
      
      const registerPlayerFn = httpsCallable(functions, 'registerPlayer');
      await registerPlayerFn({ 
        ...formData, 
        photoUrl,
        classification,
        playerType 
      });
      
      setLocation('/player');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full bg-black/40 border border-white/20 rounded-md p-3 text-white focus:outline-none focus:border-orange-500 transition-colors placeholder:text-white/40";
  const labelClasses = "block text-sm font-medium text-white/70 mb-1 uppercase tracking-wide";

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8 tracking-tight">
          PLAYER REGISTRATION
        </h1>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          {['Identity', 'Skills', 'Stats', 'Price', 'Review'].map((label, idx) => {
            const s = idx + 1;
            const isActive = step === s;
            const isPast = step > s;
            return (
              <div key={label} className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 flex items-center justify-center rounded-full text-sm font-mono border-2 mb-2 transition-colors
                  ${isActive ? 'border-orange-500 text-orange-500 bg-orange-500/10' : 
                    isPast ? 'border-green-500 text-green-500 bg-green-500/10' : 
                    'border-neutral-700 text-neutral-500 bg-neutral-800/50'}
                `}>
                  {s}
                </div>
                <span className={`text-xs uppercase tracking-wider font-medium ${isActive ? 'text-orange-500' : isPast ? 'text-green-500' : 'text-neutral-500'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-md mb-6 font-medium">
            {error}
          </div>
        )}

        <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 shadow-2xl">
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="font-display text-xl font-semibold border-b border-white/10 pb-2">Roll Number & Identity</h2>
              
              <div>
                <label className={labelClasses}>Roll Number</label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  placeholder="e.g. 21BCE1234"
                  className={`${inputClasses} font-mono`}
                />
              </div>

              {classification && (
                <div className="bg-black/30 border border-green-500/30 p-4 rounded-md">
                  <p className="text-xs text-green-400 mb-2 uppercase tracking-wide font-medium">Classification Match</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/50 block">Program</span>
                      <span className="font-medium">{classification.program}</span>
                    </div>
                    <div>
                      <span className="text-white/50 block">Branch</span>
                      <span className="font-medium">{classification.branch}</span>
                    </div>
                    <div>
                      <span className="text-white/50 block">Study Year</span>
                      <span className="font-medium">{classification.studyYear}</span>
                    </div>
                    <div>
                      <span className="text-white/50 block">Bucket</span>
                      <span className="font-medium">{BUCKET_LABELS[classification.bucketId as BucketId] || classification.bucketId}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className={labelClasses}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="As per records"
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className={`${inputClasses} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Email (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Profile Photo</label>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleChange}
                  className="block w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600 transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 2: CRICKET SKILLS */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="font-display text-xl font-semibold border-b border-white/10 pb-2">Cricket Skills</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 bg-black/40 p-4 rounded-md border border-white/10">
                  <input
                    type="checkbox"
                    id="isWk"
                    name="isWk"
                    checked={formData.isWk}
                    onChange={handleChange}
                    className="w-5 h-5 accent-orange-500 rounded bg-black border-white/20"
                  />
                  <label htmlFor="isWk" className="font-medium cursor-pointer">Do you keep wickets?</label>
                </div>

                <div className="flex items-center space-x-3 bg-black/40 p-4 rounded-md border border-white/10">
                  <input
                    type="checkbox"
                    id="isBatter"
                    name="isBatter"
                    checked={formData.isBatter}
                    onChange={handleChange}
                    className="w-5 h-5 accent-orange-500 rounded bg-black border-white/20"
                  />
                  <label htmlFor="isBatter" className="font-medium cursor-pointer">Do you primarily bat?</label>
                </div>

                <div className="flex items-center space-x-3 bg-black/40 p-4 rounded-md border border-white/10">
                  <input
                    type="checkbox"
                    id="isBowler"
                    name="isBowler"
                    checked={formData.isBowler}
                    onChange={handleChange}
                    className="w-5 h-5 accent-orange-500 rounded bg-black border-white/20"
                  />
                  <label htmlFor="isBowler" className="font-medium cursor-pointer">Do you primarily bowl?</label>
                </div>
              </div>

              {formData.isBatter && (
                <div className="bg-black/20 p-4 rounded-md border border-white/10 space-y-4">
                  <label className={labelClasses}>Batting Style</label>
                  <select name="battingStyle" value={formData.battingStyle} onChange={handleChange} className={inputClasses}>
                    <option value="">Select Style</option>
                    <option value="Right">Right Handed</option>
                    <option value="Left">Left Handed</option>
                  </select>
                </div>
              )}

              {formData.isBowler && (
                <div className="bg-black/20 p-4 rounded-md border border-white/10 space-y-4">
                  <label className={labelClasses}>Bowling Details</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select name="bowlingStyle" value={formData.bowlingStyle} onChange={handleChange} className={inputClasses}>
                      <option value="">Select Style</option>
                      <option value="Fast">Fast</option>
                      <option value="Medium">Medium</option>
                      <option value="Spin">Spin</option>
                    </select>
                    <select name="bowlingArm" value={formData.bowlingArm} onChange={handleChange} className={inputClasses}>
                      <option value="">Select Arm</option>
                      <option value="Right">Right Arm</option>
                      <option value="Left">Left Arm</option>
                    </select>
                  </div>
                </div>
              )}

              {playerType && (
                <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-md flex items-center justify-between">
                  <span className="text-white/70 uppercase tracking-wide text-sm font-medium">Derived Role</span>
                  <span className="font-display font-bold text-orange-400 text-lg">{playerType.replace('_', ' ')}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: STATS */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="font-display text-xl font-semibold border-b border-white/10 pb-2">CricHeroes & Stats</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>CricHeroes Profile URL (Optional)</label>
                  <input type="url" name="cricHeroesUrl" value={formData.cricHeroesUrl} onChange={handleChange} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>CricHeroes Registered Mobile (Optional)</label>
                  <input type="tel" name="cricHeroesMobile" value={formData.cricHeroesMobile} onChange={handleChange} className={`${inputClasses} font-mono`} />
                </div>
              </div>

              <div className="pt-4">
                <h3 className="font-display text-lg mb-4 text-white/90">Career Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['matchesPlayed', 'runsScored', 'wicketsTaken', 'catches', 'stumpings'].map(field => (
                    <div key={field}>
                      <label className={labelClasses}>{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                      <input type="number" name={field} value={formData[field as keyof typeof formData] as number} onChange={handleChange} className={`${inputClasses} font-mono text-center`} min="0" />
                    </div>
                  ))}
                  <div>
                    <label className={labelClasses}>Strike Rate</label>
                    <input type="number" step="0.01" name="strikeRate" value={formData.strikeRate} onChange={handleChange} className={`${inputClasses} font-mono text-center`} min="0" />
                  </div>
                  <div>
                    <label className={labelClasses}>Batting Avg</label>
                    <input type="number" step="0.01" name="battingAverage" value={formData.battingAverage} onChange={handleChange} className={`${inputClasses} font-mono text-center`} min="0" />
                  </div>
                  <div>
                    <label className={labelClasses}>Bowling Avg</label>
                    <input type="number" step="0.01" name="bowlingAverage" value={formData.bowlingAverage} onChange={handleChange} className={`${inputClasses} font-mono text-center`} min="0" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PRICE & REFERENCE */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="font-display text-xl font-semibold border-b border-white/10 pb-2">Base Price & References</h2>
              
              <div>
                <label className={labelClasses}>Select Base Price</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mt-2">
                  {BASE_PRICE_LADDER.map(price => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, basePrice: price }))}
                      className={`
                        py-3 rounded-md font-mono text-sm font-bold transition-all border
                        ${formData.basePrice === price 
                          ? 'bg-orange-500 text-white border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)] scale-105' 
                          : 'bg-black/50 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'}
                      `}
                    >
                      {price}
                    </button>
                  ))}
                </div>
                {formData.basePrice > 0 && (
                  <p className="mt-4 text-center text-orange-400 font-mono font-bold text-xl">
                    Base Price Selected: {formData.basePrice} Points
                  </p>
                )}
              </div>

              {classification?.referenceEligible && (
                <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="referenceClaimed"
                    name="referenceClaimed"
                    checked={formData.referenceClaimed}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 accent-yellow-500 rounded bg-black border-white/20"
                  />
                  <div>
                    <label htmlFor="referenceClaimed" className="font-medium cursor-pointer text-yellow-500 block mb-1">
                      I declare I have been referred by a franchise
                    </label>
                    <p className="text-xs text-white/60">
                      Checking this indicates you have discussed terms with a franchise. This claim will be verified independently by admins and the franchise.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="font-display text-xl font-semibold border-b border-white/10 pb-2">Review & Submit</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/30 p-4 rounded-md border border-white/5">
                <div>
                  <h3 className="text-xs text-white/50 uppercase tracking-wide mb-3 font-semibold">Identity</h3>
                  <div className="space-y-1">
                    <p><span className="text-white/40 inline-block w-24">Name:</span> <span className="font-medium">{formData.name}</span></p>
                    <p><span className="text-white/40 inline-block w-24">Roll No:</span> <span className="font-mono">{formData.rollNumber}</span></p>
                    <p><span className="text-white/40 inline-block w-24">Mobile:</span> <span className="font-mono">{formData.mobileNumber}</span></p>
                    {classification && (
                      <p><span className="text-white/40 inline-block w-24">Bucket:</span> <span className="text-green-400">{BUCKET_LABELS[classification.bucketId as BucketId] || classification.bucketId}</span></p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xs text-white/50 uppercase tracking-wide mb-3 font-semibold">Role</h3>
                  <div className="space-y-1">
                    <p><span className="text-white/40 inline-block w-24">Type:</span> <span className="font-medium text-orange-400">{playerType?.replace('_', ' ')}</span></p>
                    <p><span className="text-white/40 inline-block w-24">Batting:</span> <span>{formData.battingStyle || 'N/A'}</span></p>
                    <p><span className="text-white/40 inline-block w-24">Bowling:</span> <span>{formData.bowlingStyle ? `${formData.bowlingArm} Arm ${formData.bowlingStyle}` : 'N/A'}</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs text-white/50 uppercase tracking-wide mb-3 font-semibold">Pricing & Ref</h3>
                  <div className="space-y-1">
                    <p><span className="text-white/40 inline-block w-24">Base Price:</span> <span className="font-mono text-orange-400 text-lg font-bold">{formData.basePrice}</span></p>
                    <p><span className="text-white/40 inline-block w-24">Referred:</span> <span>{formData.referenceClaimed ? 'Yes' : 'No'}</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs text-white/50 uppercase tracking-wide mb-3 font-semibold">Stats Summary</h3>
                  <div className="space-y-1 text-sm font-mono text-white/80">
                    <p>M: {formData.matchesPlayed} | R: {formData.runsScored} | W: {formData.wicketsTaken}</p>
                    <p>SR: {formData.strikeRate} | B.Avg: {formData.battingAverage}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-white/60 text-center mb-6">
                  Please ensure all details are accurate. This information will be visible to franchises during the auction.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/10">
            {step > 1 ? (
              <button
                onClick={handlePrev}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-md font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                BACK
              </button>
            ) : <div />}
            
            {step < 5 ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-md font-bold bg-white text-black hover:bg-neutral-200 transition-colors"
              >
                NEXT STEP
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-md font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REGISTRATION'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
