import React from 'react';

interface ActionBarProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
  onSubmit: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  currentStep,
  totalSteps,
  isSubmitting,
  canContinue,
  onBack,
  onContinue,
  onSubmit,
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="sticky bottom-0 z-20 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 -mx-4 md:-mx-8 px-4 md:px-8 mt-8 shadow-2xl">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          disabled={isFirstStep || isSubmitting}
          className={`min-h-[48px] px-6 py-3 rounded-xl border font-bold text-sm transition-all flex items-center justify-center ${
            isFirstStep || isSubmitting
              ? 'opacity-30 cursor-not-allowed border-slate-300 dark:border-slate-700 text-slate-400'
              : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
          }`}
        >
          \u2190 BACK
        </button>

        {/* Continue or Submit Button */}
        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canContinue || isSubmitting}
            className={`min-h-[48px] px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center shadow-lg active:scale-95 ${
              !canContinue || isSubmitting
                ? 'opacity-40 cursor-not-allowed bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 ring-2 ring-emerald-400/40'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                SUBMITTING REGISTRATION...
              </span>
            ) : (
              'SUBMIT REGISTRATION \u2192'
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue || isSubmitting}
            className={`min-h-[48px] px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center shadow-lg active:scale-95 ${
              !canContinue
                ? 'opacity-40 cursor-not-allowed bg-slate-300 dark:bg-slate-800 text-slate-500'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 ring-2 ring-emerald-400/40'
            }`}
          >
            CONTINUE \u2192
          </button>
        )}
      </div>
    </div>
  );
};
