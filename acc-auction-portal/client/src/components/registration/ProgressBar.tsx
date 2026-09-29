import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, stepLabels }) => {
  const percentage = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="w-full mb-8">
      {/* Header with Tournament Brand */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-serif font-bold text-emerald-400 text-lg shadow-sm">
            ACC
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl md:text-2xl text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              Avanthi Cricket Carnival
            </h1>
            <p className="text-xs uppercase tracking-widest font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              ACC 2026 \u00B7 Player Registration
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="font-serif font-bold text-sm text-slate-900 dark:text-slate-200">
            {stepLabels[currentStep - 1]}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-5 gap-1 mt-3">
        {stepLabels.map((label, idx) => {
          const stepNum = idx + 1;
          const isCurrent = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;

          return (
            <div key={label} className="flex flex-col items-center text-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-slate-950 font-extrabold'
                    : isCurrent
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                {isCompleted ? '\u2713' : stepNum}
              </div>
              <span
                className={`hidden sm:block text-[11px] mt-1 font-medium truncate max-w-[80px] ${
                  isCurrent
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : isCompleted
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
