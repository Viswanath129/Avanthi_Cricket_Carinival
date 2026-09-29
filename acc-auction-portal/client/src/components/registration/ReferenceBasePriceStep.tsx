import React from 'react';
import { BASE_PRICE_LADDER } from '@shared/types';

interface FranchiseOption {
  id: number;
  name: string;
  department: string;
}

const FRANCHISES: FranchiseOption[] = [
  { id: 1, name: 'CSE Champions', department: 'Computer Science & Engineering' },
  { id: 2, name: 'ECE Electro Kings', department: 'Electronics & Communication' },
  { id: 3, name: 'Mechanical Warriors', department: 'Mechanical Engineering' },
  { id: 4, name: 'Civil Gladiators', department: 'Civil Engineering' },
  { id: 5, name: 'EEE Spark Royals', department: 'Electrical & Electronics' },
  { id: 6, name: 'CSM Cyber Knights', department: 'CSM (AI & ML)' },
  { id: 7, name: 'CSD Data Strikers', department: 'CSD (Data Science)' },
  { id: 8, name: 'Diploma Dynamic Titans', department: 'Diploma Wing' },
  { id: 9, name: 'Pharmacy Phoenix', department: 'Pharmacy Wing' },
  { id: 10, name: 'MBA Mavericks', department: 'Management Wing' },
  { id: 11, name: 'Staff Super Kings', department: 'Staff & Administration' },
];

interface ReferenceBasePriceStepProps {
  isReferenceEligible: boolean;
  referenceClaimed: boolean;
  referringFranchiseId: number | null;
  basePrice: number;
  onChange: (field: string, value: any) => void;
}

export const ReferenceBasePriceStep: React.FC<ReferenceBasePriceStepProps> = ({
  isReferenceEligible,
  referenceClaimed,
  referringFranchiseId,
  basePrice,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="font-serif font-bold text-xl text-slate-900 dark:text-slate-100">
          Step 5: Reference Declaration & Base Price
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Complete your registration parameters. Choose your starting auction auction base price from the official tournament price ladder.
        </p>
      </div>

      {/* ACC Reference Declaration - Shown ONLY if admission year === current academic year */}
      {isReferenceEligible ? (
        <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
              ACC Reference Declaration
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider">
              Fresh Admission Eligible
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Did you join Avanthi Institute through the ACC Reference Program? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: true, label: 'Yes, Referred by a Team' },
                { val: false, label: 'No, Direct Admission' },
              ].map((opt) => (
                <button
                  key={String(opt.val)}
                  type="button"
                  onClick={() => {
                    onChange('referenceClaimed', opt.val);
                    if (!opt.val) onChange('referringFranchiseId', null);
                  }}
                  className={`min-h-[48px] p-3 rounded-xl border text-sm font-semibold text-center transition-all ${
                    referenceClaimed === opt.val
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {referenceClaimed && (
            <div className="space-y-2 pt-2 animate-in fade-in duration-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Which franchise team referred you to Avanthi? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {FRANCHISES.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => onChange('referringFranchiseId', team.id)}
                    className={`min-h-[48px] p-2.5 rounded-xl border text-left flex flex-col justify-center transition-all ${
                      referringFranchiseId === team.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs truncate">{team.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{team.department}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Super Admin cross-checks player and franchise claims before confirming referral allotment outside auction purse.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          \u24D8 Reference declaration is exclusively available for current-year admissions (fresh 1st year, lateral entry admitted this year, or new PG/diploma students).
        </div>
      )}

      {/* Base Price Selection Ladder */}
      <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div>
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
              Auction Base Price Ladder
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select strictly from the authorized 16-step tournament price scale.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block uppercase">Selected Price</span>
            <span className="font-mono font-bold text-xl text-emerald-600 dark:text-emerald-400">
              {basePrice ? `${basePrice} Credits` : '\u2014'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {BASE_PRICE_LADDER.map((ladderVal) => (
            <button
              key={ladderVal}
              type="button"
              onClick={() => onChange('basePrice', ladderVal)}
              className={`min-h-[48px] py-2 px-1 rounded-xl border font-mono font-bold text-sm flex flex-col items-center justify-center transition-all ${
                basePrice === ladderVal
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-md scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{ladderVal}</span>
              <span className={`text-[9px] ${basePrice === ladderVal ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>pts</span>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Rule: Bidding opens at base price. No arbitrary values outside the 16 ladder steps are accepted.
        </p>
      </div>

      {/* Mandatory Summary Preview */}
      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
        <p className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
          Post-Submission Registration State:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
          <div>Status: <strong className="text-slate-900 dark:text-slate-100">REGISTERED</strong></div>
          <div>Payment: <strong className="text-amber-600 dark:text-amber-400">UNPAID</strong></div>
          <div>Eligibility: <strong className="text-slate-900 dark:text-slate-100">PENDING APPROVAL</strong></div>
          <div>Catalog: <strong className="text-emerald-600 dark:text-emerald-400">VISIBLE</strong></div>
        </div>
      </div>
    </div>
  );
};
