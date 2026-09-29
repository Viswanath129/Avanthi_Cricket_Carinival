import React, { useState } from 'react';

interface StatsCricHeroesStepProps {
  cricHeroesUrl: string;
  cricHeroesMobile: string;
  cricHeroesPending: boolean;
  matchesPlayed: number;
  runsScored: number;
  highestScore: number;
  battingAverage: number;
  strikeRate: number;
  wicketsTaken: number;
  bowlingAverage: number;
  economyRate: number;
  bestBowling: string;
  catches: number;
  stumpings: number;
  onChange: (field: string, value: any) => void;
}

export const StatsCricHeroesStep: React.FC<StatsCricHeroesStepProps> = ({
  cricHeroesUrl,
  cricHeroesMobile,
  cricHeroesPending,
  matchesPlayed,
  runsScored,
  highestScore,
  battingAverage,
  strikeRate,
  wicketsTaken,
  bowlingAverage,
  economyRate,
  bestBowling,
  catches,
  stumpings,
  onChange,
}) => {
  const [statsOpen, setStatsOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleSkipCricHeroes = () => {
    onChange('cricHeroesPending', !cricHeroesPending);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="font-serif font-bold text-xl text-slate-900 dark:text-slate-100">
          Step 4: CricHeroes Profile & Career Stats
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Link your official CricHeroes cricket profile for statistical verification. If you don't have one yet, registration remains completely non-blocking.
        </p>
      </div>

      {/* CricHeroes Panel */}
      <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
              CricHeroes Profile Verification
            </h3>
          </div>
          <button
            type="button"
            onClick={handleSkipCricHeroes}
            className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              cricHeroesPending
                ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {cricHeroesPending ? '\u2713 Flagged: Profile Creation Pending' : '[ SKIP FOR NOW \u2014 I\u2019LL ADD LATER ]'}
          </button>
        </div>

        {cricHeroesPending ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
            <p className="font-bold mb-1">\u24D8 Non-blocking status active</p>
            <p>
              Your player account will be submitted with status: <strong>"Profile Creation Pending"</strong>. You can update your CricHeroes URL anytime before the auction directly from your Player Dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                CricHeroes Profile URL
              </label>
              <input
                type="url"
                value={cricHeroesUrl}
                onChange={(e) => onChange('cricHeroesUrl', e.target.value)}
                placeholder="https://cricheroes.com/player-profile/..."
                className="w-full min-h-[48px] px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                CricHeroes Mobile (Private)
              </label>
              <input
                type="tel"
                value={cricHeroesMobile}
                onChange={(e) => onChange('cricHeroesMobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Mobile registered with CricHeroes app"
                className="w-full min-h-[48px] px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                May differ from your contact number. Stored privately for record reconciliation.
              </p>
            </div>
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
          >
            \u24D8 How to create and find your CricHeroes profile?
          </button>
          {showGuide && (
            <div className="mt-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p>1. Download the CricHeroes app from Google Play or Apple App Store.</p>
              <p>2. Sign up with your mobile number and enter your full name.</p>
              <p>3. Tap "My Profile" \u2192 Share Icon \u2192 Copy Profile Link, and paste it above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Career Statistics (Self-Declared) */}
      <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <div
          onClick={() => setStatsOpen(!statsOpen)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                Career Cricket Statistics
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                Self-Declared
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Declared career benchmarks. Labeled as self-declared throughout the platform.
            </p>
          </div>
          <button
            type="button"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 text-lg font-bold"
          >
            {statsOpen ? '\u2212' : '+'}
          </button>
        </div>

        {statsOpen && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-medium">
              \u24D8 Self-declared metrics. CricHeroes profile link helps Super Admin verify performance during squad bidding.
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Matches Played</label>
                <input
                  type="number"
                  min="0"
                  value={matchesPlayed || ''}
                  onChange={(e) => onChange('matchesPlayed', Number(e.target.value))}
                  placeholder="0"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Total Runs</label>
                <input
                  type="number"
                  min="0"
                  value={runsScored || ''}
                  onChange={(e) => onChange('runsScored', Number(e.target.value))}
                  placeholder="0"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Batting Average</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={battingAverage || ''}
                  onChange={(e) => onChange('battingAverage', Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Strike Rate</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={strikeRate || ''}
                  onChange={(e) => onChange('strikeRate', Number(e.target.value))}
                  placeholder="0.0"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Highest Score</label>
                <input
                  type="number"
                  min="0"
                  value={highestScore || ''}
                  onChange={(e) => onChange('highestScore', Number(e.target.value))}
                  placeholder="0"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Wickets Taken</label>
                <input
                  type="number"
                  min="0"
                  value={wicketsTaken || ''}
                  onChange={(e) => onChange('wicketsTaken', Number(e.target.value))}
                  placeholder="0"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bowling Average</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={bowlingAverage || ''}
                  onChange={(e) => onChange('bowlingAverage', Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Economy Rate</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={economyRate || ''}
                  onChange={(e) => onChange('economyRate', Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Best Bowling Figures</label>
                <input
                  type="text"
                  value={bestBowling || ''}
                  onChange={(e) => onChange('bestBowling', e.target.value)}
                  placeholder="e.g. 4/18"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catches</label>
                <input
                  type="number"
                  min="0"
                  value={catches || ''}
                  onChange={(e) => onChange('catches', Number(e.target.value))}
                  placeholder="0"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stumpings</label>
                <input
                  type="number"
                  min="0"
                  value={stumpings || ''}
                  onChange={(e) => onChange('stumpings', Number(e.target.value))}
                  placeholder="0"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
