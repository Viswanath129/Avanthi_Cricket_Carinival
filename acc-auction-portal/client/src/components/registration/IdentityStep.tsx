import React, { useState } from 'react';
import { UseRollParserReturn } from '@/hooks/useRollParser';
import { BUCKET_LABELS } from '@shared/types';

interface IdentityStepProps {
  rollNumber: string;
  name: string;
  mobileNumber: string;
  email: string;
  isDetained: boolean;
  detainedNote: string;
  rollParser: UseRollParserReturn;
  onChange: (field: string, value: any) => void;
}

export const IdentityStep: React.FC<IdentityStepProps> = ({
  rollNumber,
  name,
  mobileNumber,
  email,
  isDetained,
  detainedNote,
  rollParser,
  onChange,
}) => {
  const [showDetainedModal, setShowDetainedModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="font-serif font-bold text-xl text-slate-900 dark:text-slate-100">
          Step 1: Student Identity Verification
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Enter your official Avanthi Institute Roll Number. Academic program, branch, year, and scarcity bucket are derived automatically.
        </p>
      </div>

      {/* Roll Number Input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          Roll Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={rollNumber}
            onChange={(e) => onChange('rollNumber', e.target.value.toUpperCase())}
            placeholder="e.g. 25811A0403 or 24597-CM-015"
            maxLength={15}
            className="w-full min-h-[48px] px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
          />
          {rollParser.isValid && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-lg">
              \u2713
            </div>
          )}
        </div>

        {/* Live Parse Preview Card */}
        {rollParser.classification && (
          <div className="mt-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-slate-800 dark:text-slate-200 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono font-bold text-emerald-700 dark:text-emerald-400">
                Verified Academic Classification
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
                Bucket: {rollParser.classification.bucket}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Program</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{rollParser.classification.program}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Branch</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{rollParser.classification.branch}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Study Year</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">Year {rollParser.classification.studyYear}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Category</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {BUCKET_LABELS[rollParser.classification.bucket] || rollParser.classification.bucket}
                </span>
              </div>
            </div>
          </div>
        )}

        {rollParser.error && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
            \u26A0 {rollParser.error}
          </p>
        )}
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          Full Name (as per college ID) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g. S. Sai Teja"
          className="w-full min-h-[48px] px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {/* Contact Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Mobile Number (Private) <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={mobileNumber}
            onChange={(e) => onChange('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit mobile number"
            className="w-full min-h-[48px] px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Strictly private: never disclosed on public catalog or live projector.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Email Address (Optional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="student@avanthi.edu.in"
            className="w-full min-h-[48px] px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Discrepancy / Detained Flag */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowDetainedModal(!showDetainedModal)}
          className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
        >
          \u2691 Have a year gap, detention, or academic rollover discrepancy?
        </button>

        {showDetainedModal && (
          <div className="mt-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={isDetained}
                onChange={(e) => onChange('isDetained', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Flag academic year discrepancy for Admin Review
              </span>
            </label>
            {isDetained && (
              <textarea
                value={detainedNote}
                onChange={(e) => onChange('detainedNote', e.target.value)}
                placeholder="Briefly state your current batch / year of study for Super Admin verification..."
                rows={2}
                className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
