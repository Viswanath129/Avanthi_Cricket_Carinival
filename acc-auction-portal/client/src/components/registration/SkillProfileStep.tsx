import { derivePlayerType, PlayerType } from '@shared/engine/playerType';

interface SkillProfileStepProps {
  isWk: boolean;
  isBatter: boolean;
  battingArm: 'RIGHT' | 'LEFT';
  battingStyle: string;
  battingPosition: string;
  isBowler: boolean;
  bowlingArm: 'RIGHT' | 'LEFT';
  bowlingType: 'FAST' | 'SPIN';
  onChange: (field: string, value: any) => void;
}

export const SkillProfileStep: React.FC<SkillProfileStepProps> = ({
  isWk,
  isBatter,
  battingArm,
  battingStyle,
  battingPosition,
  isBowler,
  bowlingArm,
  bowlingType,
  onChange,
}) => {
  const derivedType: PlayerType = derivePlayerType({
    isWicketKeeper: isWk,
    battingPrimary: isBatter,
    bowlingPrimary: isBowler,
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="font-serif font-bold text-xl text-slate-900 dark:text-slate-100">
          Step 3: Cricket Skill Profile & Role Derivation
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Answer the adaptive skill questionnaire below. Your primary auction role will be automatically derived.
        </p>
      </div>

      {/* Derived Role Badge */}
      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-mono text-emerald-700 dark:text-emerald-400 font-bold block">
            Derived Auction Profile
          </span>
          <span className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
            {derivedType}
          </span>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs font-mono font-bold border border-emerald-500/30">
          {isBatter && isBowler ? 'Dual Discipline' : isWk ? 'Specialist Keeper' : 'Single Discipline'}
        </div>
      </div>

      {/* SECTION A: BATTING */}
      <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
            Section A: Batting Skills
          </h3>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            {isBatter ? 'Skilled Batter' : 'Recreational Batter'}
          </span>
        </div>

        {/* Skilled Batter Yes / No */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Do you consider yourself a skilled batter? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: true, label: 'Yes, Specialized Batter' },
              { val: false, label: 'No, Lower Order / Casual' },
            ].map((opt) => (
              <button
                key={String(opt.val)}
                type="button"
                onClick={() => onChange('isBatter', opt.val)}
                className={`min-h-[48px] p-3 rounded-xl border text-sm font-semibold text-center transition-all ${
                  isBatter === opt.val
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Batting Arm (Always shown) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Batting Arm <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: 'RIGHT', label: 'Right-Hand Bat' },
              { val: 'LEFT', label: 'Left-Hand Bat' },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => onChange('battingArm', opt.val)}
                className={`min-h-[48px] p-3 rounded-xl border text-sm font-semibold text-center transition-all ${
                  battingArm === opt.val
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progressive Disclosure: Batting Style & Position only if isBatter === true */}
        {isBatter && (
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Batting Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ROTATOR', label: 'Strike Rotator' },
                  { id: 'AGGRESSIVE', label: 'Aggressive' },
                  { id: 'BIG_HITTER', label: 'Big Hitter' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onChange('battingStyle', s.id)}
                    className={`min-h-[48px] p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                      battingStyle === s.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Preferred Batting Position
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'OPENER', label: 'Opener' },
                  { id: 'TOP_ORDER', label: 'Top Order (3-4)' },
                  { id: 'MIDDLE_ORDER', label: 'Middle Order (5-6)' },
                  { id: 'FINISHER', label: 'Finisher (7+)' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onChange('battingPosition', p.id)}
                    className={`min-h-[48px] p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                      battingPosition === p.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION B: BOWLING */}
      <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
            Section B: Bowling Skills
          </h3>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            {isBowler ? 'Skilled Bowler' : 'Non-Bowler'}
          </span>
        </div>

        {/* Skilled Bowler Yes / No */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Do you consider yourself a skilled bowler? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: true, label: 'Yes, Specialized Bowler' },
              { val: false, label: 'No, Does Not Bowl' },
            ].map((opt) => (
              <button
                key={String(opt.val)}
                type="button"
                onClick={() => onChange('isBowler', opt.val)}
                className={`min-h-[48px] p-3 rounded-xl border text-sm font-semibold text-center transition-all ${
                  isBowler === opt.val
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progressive Disclosure: Bowling Arm & Type only if isBowler === true */}
        {isBowler && (
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Bowling Arm
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'RIGHT', label: 'Right-Arm' },
                    { val: 'LEFT', label: 'Left-Arm' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => onChange('bowlingArm', opt.val)}
                      className={`min-h-[48px] p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                        bowlingArm === opt.val
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Bowling Discipline
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'FAST', label: 'Pace / Seam' },
                    { val: 'SPIN', label: 'Spin / Turn' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => onChange('bowlingType', opt.val)}
                      className={`min-h-[48px] p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                        bowlingType === opt.val
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION C: WICKET KEEPING */}
      <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
            Section C: Wicket Keeping
          </h3>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            {isWk ? 'Specialist Wicket-Keeper' : 'Field Only'}
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Are you a specialized wicket-keeper? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: true, label: 'Yes, Active Wicket-Keeper' },
              { val: false, label: 'No, Outfield / Infield Only' },
            ].map((opt) => (
              <button
                key={String(opt.val)}
                type="button"
                onClick={() => onChange('isWk', opt.val)}
                className={`min-h-[48px] p-3 rounded-xl border text-sm font-semibold text-center transition-all ${
                  isWk === opt.val
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
